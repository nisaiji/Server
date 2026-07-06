import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { getAccessToken } from "./oauth.service.js";
import { getZohoAuthSessionService } from "./zohoAuthSession.service.js";
import { createZohoPaymentSession } from "./zohoPayments.service.js";
import { getZohoCredentials } from "../../config/aws/secrets.service.js";
import studentFeeDueModel from "../../models/fee/studentFeeDue.model.js";
import ledgerEntryModel from "../../models/payments/ledgerEntries.model.js";
import paymentModel from "../../models/payments/payment.model.js";
import paymentAttemptModel from "../../models/payments/paymentAttempts.model.js";
import receiptModel from "../../models/payments/receipt.model.js";
import { getParentService } from "../v2/parent.services.js";
import { getSessionStudentService } from "../v2/sessionStudent.service.js";

export async function createPaymentService(data) {
  return paymentModel.create(data);
}

export async function getPaymentService(filter) {
  return paymentModel.findOne(filter).lean();
}

export async function getPaymentsService(filter) {
  return paymentModel.find(filter).sort({ createdAt: -1 }).lean();
}

export async function updatePaymentService(filter, update) {
  return paymentModel.findOneAndUpdate(filter, update, { new: true });
}

export async function createPaymentAttemptService(data) {
  return paymentAttemptModel.create(data);
}

export async function updatePaymentAttemptService(filter, update) {
  return paymentAttemptModel.findOneAndUpdate(filter, update, { new: true });
}

export async function getReceiptByPaymentIdService(paymentId) {
  return receiptModel.findOne({ paymentId }).lean();
}

export async function getReceiptByReceiptNoService(receiptNo, adminId) {
  const filter = { receiptNo };
  if (adminId) {
    filter.adminId = adminId;
  }
  return receiptModel.findOne(filter).lean();
}

async function generateReceiptNo(adminId) {
  const year = new Date().getFullYear();
  const count = await receiptModel.countDocuments({ adminId });
  return `RCPT-${year}-${String(count + 1).padStart(6, "0")}`;
}

export async function processSuccessfulPayment({
  payment,
  paymentSessionId,
  gatewayResponse
}) {
  console.info("Processing successful payment.", {
    paymentId: payment._id,
    paymentSessionId
  });
  if (payment.status === "SUCCESS") {
    console.warn("Attempted to re-process an already successful payment.", {
      paymentId: payment._id
    });
    return { alreadyProcessed: true };
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      console.info("Starting transaction for successful payment.", {
        paymentId: payment._id
      });
      await paymentModel.findOneAndUpdate(
        { _id: payment._id },
        {
          status: "SUCCESS",
          paymentSessionId,
          paidAt: new Date(),
          gatewayResponse
        },
        { session }
      );

      await paymentAttemptModel.updateMany(
        { paymentId: payment._id, status: "PENDING" },
        { status: "SUCCESS", paymentSessionId, gatewayResponse },
        { session }
      );

      await studentFeeDueModel.updateMany(
        { _id: { $in: payment.feeDueIds } },
        { status: "PAID" },
        { session }
      );

      const existingReceipt = await receiptModel
        .findOne({ paymentId: payment._id })
        .session(session);
      if (!existingReceipt) {
        const receiptNo = await generateReceiptNo(payment.adminId);
        await receiptModel.create(
          [
            {
              receiptNo,
              adminId: payment.adminId,
              studentId: payment.studentId,
              paymentId: payment._id,
              feeDueIds: payment.feeDueIds,
              amount: payment.amount,
              issuedAt: new Date()
            }
          ],
          { session }
        );
      }

      const existingLedger = await ledgerEntryModel
        .findOne({ paymentId: payment._id })
        .session(session);
      if (!existingLedger) {
        await ledgerEntryModel.insertMany(
          [
            {
              adminId: payment.adminId,
              paymentId: payment._id,
              studentId: payment.studentId,
              account: "Bank",
              type: "DEBIT",
              amount: payment.amount,
              description: `Fee payment received - ${payment.description || ""}`,
              date: new Date()
            },
            {
              adminId: payment.adminId,
              paymentId: payment._id,
              studentId: payment.studentId,
              account: "Fee Income",
              type: "CREDIT",
              amount: payment.amount,
              description: `Fee payment received - ${payment.description || ""}`,
              date: new Date()
            }
          ],
          { session }
        );
      }
      console.info("Transaction for successful payment committed.", {
        paymentId: payment._id
      });
    });
  } catch (error) {
    console.error(
      "Transaction for successful payment failed and rolled back.",
      { paymentId: payment._id, error: error.message, stack: error.stack }
    );
    throw error; // Re-throw to be handled by the caller
  } finally {
    session.endSession();
  }

  console.info("Successfully processed payment.", { paymentId: payment._id });
  return { alreadyProcessed: false };
}

//checked
export async function processFailedPayment({
  payment,
  paymentSessionId,
  gatewayResponse
}) {
  console.warn("Processing failed payment.", {
    paymentId: payment._id,
    paymentSessionId
  });
  if (payment.status === "SUCCESS") {
    return { alreadyProcessed: true };
  }

  await paymentModel.findOneAndUpdate(
    { _id: payment._id },
    {
      status: "FAILED",
      paymentSessionId,
      gatewayResponse
    }
  );

  await paymentAttemptModel.updateMany(
    { paymentId: payment._id, status: "PENDING" },
    { status: "FAILED", paymentSessionId, gatewayResponse }
  );

  return { alreadyProcessed: false };
}

//checked
export async function validateFeeDuesForPayment({
  feeDueIds,
  studentId,
  adminId
}) {
  const dues = await studentFeeDueModel
    .find({
      _id: { $in: feeDueIds },
      studentId,
      adminId,
      status: { $in: ["PENDING", "PARTIAL", "OVERDUE"] }
    })
    .lean();

  if (dues.length !== feeDueIds.length) {
    return { valid: false, dues: [], amount: 0 };
  }

  const amount = dues.reduce((sum, due) => sum + (due.totalAmount || 0), 0);
  return { valid: true, dues, amount };
}

//checked
/**
 * Orchestrates the entire payment initiation flow.
 * @param {object} args
 * @param {string} args.sessionStudentId
 * @param {string[]} args.feeDueIds
 * @param {string} args.parentId
 * @returns {Promise<object>}
 */
export async function initiatePaymentFlow({
  sessionStudentId,
  feeDueIds,
  parentId
}) {
  // 1. Validate session student and parent ownership
  const sessionStudent = await getSessionStudentService({
    _id: sessionStudentId,
    isActive: true
  });
  if (!sessionStudent) {
    throw {
      statusCode: StatusCodes.NOT_FOUND,
      message: "Session student not found"
    };
  }

  const parent = await getParentService({ _id: parentId });
  if (!parent) {
    throw { statusCode: StatusCodes.NOT_FOUND, message: "Parent not found" };
  }

  const ownsStudent = parent.students?.some((id) =>
    id.equals(sessionStudent.student)
  );
  if (!ownsStudent) {
    throw {
      statusCode: StatusCodes.FORBIDDEN,
      message: "Unauthorized access to student"
    };
  }

  // 2. Validate fee dues
  const { valid, amount } = await validateFeeDuesForPayment({
    feeDueIds,
    studentId: sessionStudent.student,
    adminId: sessionStudent.school
  });
  if (!valid || amount <= 0) {
    throw {
      statusCode: StatusCodes.BAD_REQUEST,
      message: "Invalid, already paid, or mismatched fee dues"
    };
  }
  console.info("Fee dues validated.", {
    parentId,
    studentId: sessionStudent.student,
    amount
  });

  // 3. Create internal payment record
  const payment = await createPaymentService({
    adminId: sessionStudent.school,
    sessionStudentId,
    feeDueIds,
    amount,
    status: "CREATED",
    gateway: "ZOHO",
    currency: "INR"
  });
  console.info("Internal payment record created.", {
    paymentId: payment._id,
    status: payment.status
  });

  // 4. Get tenant-specific payment gateway credentials
  const paymentSettings = await getZohoAuthSessionService(payment.adminId);
  if (!paymentSettings?.paymentSecretKey) {
    await processFailedPayment({
      payment,
      paymentSessionId: null,
      gatewayResponse: { error: "Gateway not configured" }
    });
    console.error("Payment gateway not configured for school.", {
      schoolId: sessionStudent.school
    });
    throw {
      statusCode: StatusCodes.SERVICE_UNAVAILABLE,
      message: "Payment gateway is not configured for this school."
    };
  }

  let accessToken = paymentSettings.accessToken;
  if (
    paymentSettings.accessToken &&
    new Date() > new Date(paymentSettings.expiresAt)
  ) {
    const zohoCreds = await getZohoCredentials(
      paymentSettings.paymentSecretKey
    );
    // 5. Get a valid access token
    const zohoToken = await getAccessToken({
      clientId: zohoCreds.clientId,
      clientSecret: zohoCreds.clientSecret,
      refreshToken: zohoCreds.refreshToken,
      cacheKey: sessionStudent.school.toString() // Use schoolId as cache key
    });

    console.log("Zoho access token refreshed.", {
      schoolId: sessionStudent.school,
      accessToken: zohoToken.accessToken,
      expiresAt: zohoToken.expiresAt,
      zohoToken
    });
    // Update the access token and its expiry in the database
    await getZohoAuthSessionService(payment.adminId).then(async (session) => {
      if (session) {
        session.accessToken = zohoToken.accessToken;
        session.expiresAt = new Date(
          Date.now() + (zohoToken.expiresAt - Date.now())
        );
        await session.save();
      }
    });

    console.info("Zoho access token refreshed and updated in DB.", {
      schoolId: sessionStudent.school
    });
    accessToken = zohoToken.accessToken;
  }
  const paymentDescription = `Fee Payment for ${sessionStudentId}`;
  const zohoResponse = await createZohoPaymentSession({
    accessToken,
    amount,
    currency: payment.currency ?? "INR",
    description: paymentDescription,
    accountId: paymentSettings.accountId
  });

  const paymentSessionId = zohoResponse?.payments_session?.payments_session_id;

  if (!paymentSessionId) {
    await processFailedPayment({
      payment,
      paymentSessionId: null,
      gatewayResponse: zohoResponse
    });
    console.error("Payment gateway did not return a valid checkout session.", {
      paymentId: payment._id,
      zohoResponse
    });
    throw {
      statusCode: StatusCodes.BAD_GATEWAY,
      message: "Payment gateway did not return a checkout session."
    };
  }
  console.info("Zoho payment session created.", {
    paymentId: payment._id,
    paymentSessionId
  });

  // 7. Update internal records
  await createPaymentAttemptService({
    paymentId: payment._id,
    gateway: "ZOHO",
    paymentSessionId,
    status: "PENDING",
    gatewayResponse: zohoResponse
  });

  await updatePaymentService(
    { _id: payment._id },
    { status: "PENDING", paymentSessionId, gatewayResponse: zohoResponse }
  );

  // 8. Return data for frontend
  return {
    paymentId: payment._id,
    paymentSessionId,
    amount
  };
}
