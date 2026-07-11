import crypto from "crypto";
import { StatusCodes } from "http-status-codes";
import { getZohoCredentials } from "../../config/aws/secrets.service.js";
import studentFeeDueModel from "../../models/fee/studentFeeDue.model.js";
import paymentModel from "../../models/payments/payment.model.js";
import paymentAttemptModel from "../../models/payments/paymentAttempts.model.js";
import { getParentService } from "../parent.services.js";
import { getSessionStudentService } from "../sessionStudent.service.js";
import { getAccessToken } from "./oauth.service.js";
import { getZohoAuthSessionService } from "./zohoAuthSession.service.js";
import { createZohoPaymentSession } from "./zohoPayments.service.js";

async function validateSessionStudentOwnership({ sessionStudent, parentId }) {
  // Retrieve the parent details.
  const parent = await getParentService({ _id: parentId });
  // If parent is not found, throw an error.
  if (!parent) {
    throw { statusCode: StatusCodes.NOT_FOUND, message: "Parent not found" };
  }

  // Check if the parent owns the specified student.
  const ownsStudent = parent.students?.some((id) =>
    id.equals(sessionStudent.student)
  );
  // If the parent does not own the student, throw an authorization error.
  if (!ownsStudent) {
    throw {
      statusCode: StatusCodes.FORBIDDEN,
      message: "Unauthorized access to student"
    };
  }
}

async function validateFeeDuesForPayment({ feeDueIds, studentId, adminId }) {
  // Find all fee dues that match the provided IDs, student, admin, and are in PENDING or OVERDUE status.
  const dues = await studentFeeDueModel
    .find({
      _id: { $in: feeDueIds },
      studentId,
      adminId,
      status: { $in: ["PENDING", "OVERDUE"] }
    })
    .lean();

  // If not all requested fee dues are found, return an invalid state.
  if (dues.length !== feeDueIds.length) {
    return { valid: false, dues: [], amount: 0 };
  }

  // Calculate the total amount for the found fee dues.
  const amount = dues.reduce((sum, due) => sum + (due.totalAmount || 0), 0);

  // If the total amount is zero or less, throw an error.
  if (amount <= 0) {
    throw {
      statusCode: StatusCodes.BAD_REQUEST,
      message: "Invalid, already paid, or mismatched fee dues"
    };
  }

  // If there are dues, check for any older unpaid dues.
  if (dues.length > 0) {
    // Sort the dues by due date to find the earliest due date among the selected ones.
    const sortedDues = [...dues].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
    const earliestDueDateInSelection = sortedDues[0].dueDate;

    // Look for any pending or overdue fees with a due date earlier than the earliest selected due date.
    const priorUnpaidDue = await studentFeeDueModel.findOne({
      studentId,
      adminId,
      status: { $in: ["PENDING", "OVERDUE"] },
      dueDate: { $lt: new Date(earliestDueDateInSelection) }
    });

    // If older unpaid dues are found, throw a conflict error.
    if (priorUnpaidDue) {
      throw {
        statusCode: StatusCodes.CONFLICT,
        message:
          "There are older unpaid fees. Please clear previous dues before making a new payment."
      };
    }
  }
  // Return valid status with the found dues and total amount.
  return { valid: true, dues, amount };
}

async function createPaymentRecord({
  adminId,
  sessionStudentId,
  feeDueIds,
  amount,
  paymentHash
}) {
  // Create and return a new payment record in the database.
  return paymentModel.create({
    adminId,
    sessionStudentId,
    feeDueIds,
    amount,
    paymentHash,
    status: "CREATED",
    gateway: "ZOHO",
    currency: "INR"
  });
}

async function markPaymentFailed({
  payment,
  paymentSessionId,
  gatewayResponse
}) {
  // Update the main payment record to FAILED status with session ID and gateway response.
  await paymentModel.findOneAndUpdate(
    { _id: payment._id },
    {
      status: "FAILED",
      paymentSessionId,
      gatewayResponse
    }
  );

  // Update all associated pending payment attempts to FAILED.
  await paymentAttemptModel.updateMany(
    { paymentId: payment._id, status: "PENDING" },
    { status: "FAILED", paymentSessionId, gatewayResponse }
  );
}

async function refreshZohoAccessToken({ paymentSettings, schoolId }) {
  // Check if the current access token is still valid.
  if (new Date() <= new Date(paymentSettings?.expiresAt)) {
    return paymentSettings.accessToken;
  }

  // Retrieve Zoho credentials from AWS secrets.
  const zohoCredentials = await getZohoCredentials(
    paymentSettings.paymentSecretKey
  );
  // Obtain a new access token from Zoho using the refresh token.
  const zohoToken = await getAccessToken({
    clientId: zohoCredentials.clientId,
    clientSecret: zohoCredentials.clientSecret,
    refreshToken: zohoCredentials.refreshToken,
    cacheKey: schoolId.toString()
  });

  // Update the Zoho authentication session in the database with the new token and expiry.
  await getZohoAuthSessionService(paymentSettings.adminId).then(
    // then() callback
    async (session) => {
      if (session) {
        session.accessToken = zohoToken.accessToken;
        session.expiresAt = new Date(
          Date.now() + (zohoToken.expiresAt - Date.now())
        );
        await session.save();
      }
    }
  );

  // Return the newly acquired access token.
  return zohoToken.accessToken;
}

function generatePaymentHash({ adminId, sessionStudentId, dueIds }) {
  // Create a JSON payload from the payment details.
  const payload = JSON.stringify({
    adminId,
    sessionStudentId,
    dueIds: [...dueIds].sort()
  });

  // Generate and return a SHA256 hash of the payload.
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export async function initiatePaymentFlow({
  sessionStudentId,
  feeDueIds,
  parentId
}) {
  // Retrieve the session student details.
  const sessionStudent = await getSessionStudentService({
    _id: sessionStudentId,
    isActive: true
  });

  // If the session student is not found, throw an error.
  if (!sessionStudent) {
    throw {
      statusCode: StatusCodes.NOT_FOUND,
      message: "Session student not found"
    };
  }

  // Generate a unique payment hash for the current payment request.
  const paymentHash = generatePaymentHash({
    adminId: sessionStudent.school,
    sessionStudentId: sessionStudentId,
    dueIds: feeDueIds
  });

  // Check for existing or conflicting payment records concurrently.
  const [conflictingPayment, LatestExistingPayment] = await Promise.all([
    paymentModel.findOne({
      sessionStudentId,
      status: { $in: ["CREATED", "PENDING", "SUCCESS"] },
      feeDueIds: { $in: feeDueIds }
    }),
    paymentModel.find(
      {
        paymentHash
      },
      {},
      { limit: 1, sort: { createdAt: -1 } }
    )
  ]);

  console.log(conflictingPayment, LatestExistingPayment);
  const existingPayment = LatestExistingPayment[0];
  let useExistingPayment = false;
  const isBothSamePayments =
    existingPayment &&
    conflictingPayment &&
    existingPayment._id.equals(conflictingPayment._id);

  // If an existing payment is found, handle it based on its status.
  // id status is EXPIRED / CANCELLED / FAILED, we can create a new payment session.
  switch (existingPayment?.status) {
    case "SUCCESS":
      // If the existing payment is already successful, throw an error indicating that the payment is completed.
      throw {
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Payment already completed"
      };

    case "PENDING":
      if (new Date() < new Date(existingPayment.expiresAt)) {
        // If the session is still valid, return it.
        console.info("Existing payment session is still valid.", {
          paymentId: existingPayment._id,
          paymentSessionId: existingPayment.paymentSessionId,
          expiresAt: existingPayment.expiresAt
        });
        return {
          paymentId: existingPayment._id,
          paymentSessionId: existingPayment.paymentSessionId,
          amount: existingPayment.amount
        };
      }
      // If expired, mark as EXPIRED and proceed to create a new payment and session.
      console.info("Existing PENDING payment has expired.", {
        paymentId: existingPayment._id
      });
      await paymentModel.findByIdAndUpdate(existingPayment._id, {
        status: "EXPIRED"
      });
      await paymentAttemptModel.updateMany(
        { paymentId: existingPayment._id, status: "PENDING" },
        { status: "EXPIRED" }
      );
      break;

    case "CREATED":
      // we can re-use the payment document to create a new payment session.
      console.info(
        `Re-using existing payment record with status: ${existingPayment.status}`,
        { paymentId: existingPayment._id }
      );
      useExistingPayment = true;
      break;
  }

  // If a conflicting payment is found (some dues are already part of another pending payment), throw an error.
  if (!isBothSamePayments && conflictingPayment) {
    throw {
      statusCode: StatusCodes.CONFLICT,
      message:
        "One or more selected fee dues are already part of a pending payment. Please complete or cancel the other payment first."
    };
  }

  // Validate that the parent owns the session student.
  await validateSessionStudentOwnership({ sessionStudent, parentId });

  // Validate the selected fee dues and get the total amount.
  const { amount } = await validateFeeDuesForPayment({
    feeDueIds,
    studentId: sessionStudent.student,
    adminId: sessionStudent.school
  });

  console.info("Fee dues validated.", {
    parentId,
    studentId: sessionStudent.student,
    amount
  });

  // Create an internal payment record in the database.
  const payment = useExistingPayment
    ? existingPayment
    : await createPaymentRecord({
        adminId: sessionStudent.school,
        sessionStudentId,
        feeDueIds,
        amount,
        paymentHash
      });

  console.info("Internal payment record created.", {
    paymentId: payment._id,
    status: payment.status
  });

  // Retrieve Zoho authentication settings for the school.
  const paymentSettings = await getZohoAuthSessionService(payment.adminId);

  // If payment gateway is not configured, mark payment as failed and throw an error.
  if (!paymentSettings?.paymentSecretKey) {
    await markPaymentFailed({
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

  // Refresh the Zoho access token if it's expired.
  let accessToken = await refreshZohoAccessToken({
    paymentSettings,
    schoolId: sessionStudent.school
  });

  if (!accessToken) {
    accessToken = paymentSettings.accessToken;
  }

  const paymentDescription = `Fee Payment for ${sessionStudentId}`;

  const zohoResponse = await createZohoPaymentSession({
    accessToken,
    amount,
    currency: payment.currency ?? "INR",
    description: paymentDescription,
    accountId: paymentSettings.accountId,
    internalPaymentId: payment._id.toString()
  });

  const paymentSessionId = zohoResponse?.payments_session?.payments_session_id;

  if (!paymentSessionId) {
    await markPaymentFailed({
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

  await Promise.all([
    paymentAttemptModel.create({
      paymentId: payment._id,
      gateway: "ZOHO",
      paymentSessionId,
      status: "PENDING",
      gatewayResponse: zohoResponse
    }),

    paymentModel.findOneAndUpdate(
      { _id: payment._id, status: "CREATED" },
      {
        status: "PENDING",
        paymentSessionId,
        expiresAt: zohoResponse.payments_session.expiry_time,
        gatewayResponse: zohoResponse
      }
    )
  ]);

  return {
    paymentId: payment._id,
    paymentSessionId,
    amount
  };
}
