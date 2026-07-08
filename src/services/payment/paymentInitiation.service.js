import crypto from "crypto";
import { StatusCodes } from "http-status-codes";
import { getAccessToken } from "./oauth.service.js";
import { getZohoAuthSessionService } from "./zohoAuthSession.service.js";
import { createZohoPaymentSession } from "./zohoPayments.service.js";
import { getZohoCredentials } from "../../config/aws/secrets.service.js";
import studentFeeDueModel from "../../models/fee/studentFeeDue.model.js";
import paymentModel from "../../models/payments/payment.model.js";
import paymentAttemptModel from "../../models/payments/paymentAttempts.model.js";
import { getParentService } from "../parent.services.js";
import { getSessionStudentService } from "../sessionStudent.service.js";

async function validateSessionStudentOwnership({ sessionStudent, parentId }) {
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
}

async function validateFeeDuesForPayment({ feeDueIds, studentId, adminId }) {
  const dues = await studentFeeDueModel
    .find({
      _id: { $in: feeDueIds },
      studentId,
      adminId,
      status: { $in: ["PENDING", "OVERDUE"] }
    })
    .lean();

  if (dues.length !== feeDueIds.length) {
    return { valid: false, dues: [], amount: 0 };
  }

  const amount = dues.reduce((sum, due) => sum + (due.totalAmount || 0), 0);

  if (amount <= 0) {
    throw {
      statusCode: StatusCodes.BAD_REQUEST,
      message: "Invalid, already paid, or mismatched fee dues"
    };
  }

  if (dues.length > 0) {
    const sortedDues = [...dues].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
    const earliestDueDateInSelection = sortedDues[0].dueDate;

    const priorUnpaidDue = await studentFeeDueModel.findOne({
      studentId,
      adminId,
      status: { $in: ["PENDING", "OVERDUE"] },
      dueDate: { $lt: new Date(earliestDueDateInSelection) }
    });

    if (priorUnpaidDue) {
      throw {
        statusCode: StatusCodes.CONFLICT,
        message:
          "There are older unpaid fees. Please clear previous dues before making a new payment."
      };
    }
  }
  return { valid: true, dues, amount };
}

async function createPaymentRecord({
  adminId,
  sessionStudentId,
  feeDueIds,
  amount,
  paymentHash
}) {
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
}

async function refreshZohoAccessToken({ paymentSettings, schoolId }) {
  if (new Date() <= new Date(paymentSettings?.expiresAt)) {
    return paymentSettings.accessToken;
  }

  const zohoCredentials = await getZohoCredentials(
    paymentSettings.paymentSecretKey
  );
  const zohoToken = await getAccessToken({
    clientId: zohoCredentials.clientId,
    clientSecret: zohoCredentials.clientSecret,
    refreshToken: zohoCredentials.refreshToken,
    cacheKey: schoolId.toString()
  });

  await getZohoAuthSessionService(paymentSettings.adminId).then(
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

  return zohoToken.accessToken;
}

function generatePaymentHash({ adminId, sessionStudentId, dueIds }) {
  const payload = JSON.stringify({
    adminId,
    sessionStudentId,
    dueIds: [...dueIds].sort()
  });

  return crypto.createHash("sha256").update(payload).digest("hex");
}

export async function initiatePaymentFlow({
  sessionStudentId,
  feeDueIds,
  parentId
}) {
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

  const paymentHash = generatePaymentHash({
    adminId: sessionStudent.school,
    sessionStudentId: sessionStudentId,
    dueIds: feeDueIds
  });

  const [conflictingPayment, existingPayment] = await Promise.all([
    paymentModel.findOne({
      sessionStudentId,
      status: { $in: ["CREATED", "PENDING"] },
      feeDueIds: { $in: feeDueIds }
    }),
    paymentModel.findOne({
      paymentHash,
      status: { $in: ["CREATED", "PENDING", "SUCCESS"] }
    })
  ]);

  if (existingPayment) {
    console.info("Found existing payment record.", {
      paymentId: existingPayment._id,
      status: existingPayment.status
    });
    if (existingPayment.status === "SUCCESS") {
      throw {
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Payment already completed"
      };
    } else {
      return {
        paymentId: existingPayment._id,
        paymentSessionId: existingPayment.paymentSessionId,
        amount: existingPayment.amount
      };
    }
  }

  if (conflictingPayment) {
    throw {
      statusCode: StatusCodes.CONFLICT,
      message:
        "One or more selected fee dues are already part of a pending payment. Please complete or cancel the other payment first."
    };
  }

  await validateSessionStudentOwnership({ sessionStudent, parentId });

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

  const payment = await createPaymentRecord({
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

  const paymentSettings = await getZohoAuthSessionService(payment.adminId);

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
        expiresAt: zohoResponse.expiresAt,
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
