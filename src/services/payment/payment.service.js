import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import studentFeeDueModel from "../../models/fee/studentFeeDue.model.js";
import ledgerEntryModel from "../../models/payments/ledgerEntries.model.js";
import paymentModel from "../../models/payments/payment.model.js";
import paymentAttemptModel from "../../models/payments/paymentAttempts.model.js";
import receiptModel from "../../models/payments/receipt.model.js";
import { getSessionStudentService } from "../sessionStudent.service.js";
import {
  initiatePaymentFlow as initiatePaymentFlowService,
  validateSessionStudentOwnership
} from "./paymentInitiation.service.js";

export async function createPaymentService(data) {
  return paymentModel.create(data);
}

export async function getPaymentService(filter) {
  return paymentModel.findOne(filter).lean();
}

export async function getPaymentsService(filter) {
  return paymentModel.find(filter).sort({ createdAt: -1 }).lean();
}

export async function getAdminPaymentsService(filter) {
  return paymentModel.find(filter).sort({ createdAt: -1 }).lean();
}

export async function getAdminPaymentsAggregationService(
  adminId,
  skip,
  limit,
  sessionStudentId = null
) {
  const filter = {
    adminId: new mongoose.Types.ObjectId(adminId),
    status: { $in: ["SUCCESS", "FAILED"] }
  };
  if (sessionStudentId) {
    filter.sessionStudentId = new mongoose.Types.ObjectId(sessionStudentId);
  }

  /** @type {any[]} */
  const pipeline = [
    { $match: filter },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: "session_students",
        localField: "sessionStudentId",
        foreignField: "_id",
        pipeline: [{ $project: { student: 1, classId: 1, section: 1 } }],
        as: "sessionStudent"
      }
    },
    { $unwind: { path: "$sessionStudent", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "students",
        localField: "sessionStudent.student",
        foreignField: "_id",
        pipeline: [{ $project: { firstName: 1, lastName: 1, parent: 1 } }],
        as: "student"
      }
    },
    { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "parents",
        localField: "student.parent",
        foreignField: "_id",
        pipeline: [{ $project: { phone: 1 } }],
        as: "parent"
      }
    },
    { $unwind: { path: "$parent", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "classes",
        localField: "sessionStudent.classId",
        foreignField: "_id",
        pipeline: [{ $project: { name: 1 } }],
        as: "classInfo"
      }
    },
    { $unwind: { path: "$classInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "sections",
        localField: "sessionStudent.section",
        foreignField: "_id",
        pipeline: [{ $project: { name: 1 } }],
        as: "sectionInfo"
      }
    },
    { $unwind: { path: "$sectionInfo", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        studentSessionId: "$sessionStudent._id",
        classId: "$classInfo._id",
        sectionId: "$sectionInfo._id",
        studentName: {
          $concat: [
            { $ifNull: ["$student.firstName", ""] },
            " ",
            { $ifNull: ["$student.lastName", ""] }
          ]
        },
        class: "$classInfo.name",
        section: "$sectionInfo.name",
        phone: { $ifNull: ["$parent.phone", ""] },
        paymentRef: { $ifNull: ["$paymentSessionId", { $toString: "$_id" }] },
        amount: 1,
        currency: 1,
        paymentMode: { $ifNull: ["$paymentMethod", "Unknown"] },
        dateTime: "$statusUpdatedAt",
        status: 1
      }
    }
  ];

  const payments = await paymentModel.aggregate(pipeline);
  const totalCount = await paymentModel.countDocuments(
    /** @type {any} */ (filter)
  );

  return { payments, totalCount };
}

export async function updatePaymentService(filter, update) {
  return paymentModel.findOneAndUpdate(filter, update, {
    returnDocument: "after"
  });
}

export async function createPaymentAttemptService(data) {
  return paymentAttemptModel.create(data);
}

export async function updatePaymentAttemptService(filter, update) {
  return paymentAttemptModel.findOneAndUpdate(filter, update, {
    returnDocument: "after"
  });
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
      const paymentMethodType =
        gatewayResponse?.event_object?.payment_method?.type ??
        gatewayResponse?.event_object?.payment?.payment_method?.type ??
        gatewayResponse?.event_object?.payment?.payment_method?.name ??
        "UNKNOWN";

      if (paymentMethodType === "UNKNOWN") {
        console.warn(
          "Unable to resolve payment method type from webhook payload.",
          {
            paymentId: payment._id
          }
        );
      }

      await paymentModel.findOneAndUpdate(
        { _id: payment._id },
        {
          status: "SUCCESS",
          paymentSessionId,
          statusUpdatedAt: new Date(),
          paymentMethod: paymentMethodType
        },
        { session }
      );

      await paymentAttemptModel.updateMany(
        { paymentId: payment._id, status: { $in: ["PENDING", "EXPIRED"] } },
        {
          status: "SUCCESS",
          paymentSessionId,
          gatewayWebhookEventId: gatewayResponse.event_id
        },
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
              sessionStudentId: payment.sessionStudentId,
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
              sessionStudentId: payment.sessionStudentId,
              account: "Bank",
              type: "DEBIT",
              amount: payment.amount,
              description: `Fee payment received - ${payment.description || ""}`,
              date: new Date()
            },
            {
              adminId: payment.adminId,
              paymentId: payment._id,
              sessionStudentId: payment.sessionStudentId,
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
      gatewayResponse,
      statusUpdatedAt: new Date()
    }
  );

  await paymentAttemptModel.updateMany(
    { paymentId: payment._id, status: "PENDING" },
    {
      status: "FAILED",
      paymentSessionId,
      gatewayWebhookEventId: gatewayResponse.event_id
    }
  );

  return { alreadyProcessed: false };
}

/**
 * Orchestrates the entire payment initiation flow.
 * @param {object} args
 * @param {string} args.sessionStudentId
 * @param {string[]} args.feeDueIds
 * @param {string} args.parentId
 * @returns {Promise<object>}
 */
export async function initiatePaymentFlow(args) {
  return initiatePaymentFlowService(args);
}

/**
 * Cancels a payment if it is in a cancellable state (CREATED or PENDING).
 * Verifies that the parent initiating the cancellation is authorized.
 *
 * @param {object} args
 * @param {string} args.paymentId - The ID of the payment to cancel.
 * @param {string} args.parentId - The ID of the parent requesting the cancellation.
 * @returns {Promise<object>} The updated payment document.
 * @throws {Error} If the payment is not found, not in a cancellable state, or if the parent is not authorized.
 */
export async function cancelPaymentFlow({ paymentId, parentId }) {
  // 1. Find the payment record.
  const payment = await paymentModel.findById(paymentId).lean();

  if (!payment) {
    throw { statusCode: StatusCodes.NOT_FOUND, message: "Payment not found" };
  }

  // 2. Verify that the parent is authorized to cancel this payment.
  const sessionStudent = await getSessionStudentService({
    _id: payment.sessionStudentId
  });
  if (!sessionStudent) {
    throw {
      statusCode: StatusCodes.NOT_FOUND,
      message: "Associated student session not found for this payment."
    };
  }
  await validateSessionStudentOwnership({ sessionStudent, parentId });

  // 3. Check if the payment is in a cancellable state.
  if (payment.status !== "PENDING" && payment.status !== "CREATED") {
    throw {
      statusCode: StatusCodes.BAD_REQUEST,
      message: `Payment cannot be cancelled. Current status: ${payment.status}`
    };
  }

  // 4. Atomically update the payment and its attempts to 'CANCELLED'.
  const [updatedPayment] = await Promise.all([
    paymentModel.findByIdAndUpdate(
      paymentId,
      { status: "CANCELLED" },
      { returnDocument: "after" }
    ),
    paymentAttemptModel.updateMany(
      { paymentId, status: "PENDING" },
      { status: "CANCELLED" }
    )
  ]);

  console.info("Payment cancelled successfully.", { paymentId });
  return updatedPayment;
}

/**
 * Get total collected fees and daily trend for a specific month
 */
export async function getCollectedFeesAndTrendService(adminId, month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const filter = {
    adminId: new mongoose.Types.ObjectId(adminId),
    status: { $in: ["SUCCESS", "PAID"] },
    createdAt: { $gte: startDate, $lte: endDate }
  };

  /** @type {any[]} */
  const pipeline = [
    { $match: filter },
    {
      $group: {
        _id: { $dayOfMonth: "$createdAt" },
        totalAmount: { $sum: "$amount" }
      }
    },
    { $sort: { _id: 1 } }
  ];

  const results = await paymentModel.aggregate(pipeline);

  let totalCollected = 0;
  const trend = [];

  const daysInMonth = endDate.getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    trend.push({ day: i, amount: 0 });
  }

  results.forEach((item) => {
    totalCollected += item.totalAmount;
    trend[item._id - 1].amount = item.totalAmount;
  });

  return { totalCollected, trend };
}

/**
 * Get total outstanding fees across all students
 */
export async function getOutstandingFeesService(adminId) {
  const filter = {
    adminId: new mongoose.Types.ObjectId(adminId),
    status: { $in: ["PENDING", "OVERDUE"] }
  };

  /** @type {any[]} */
  const pipeline = [
    { $match: filter },
    {
      $group: {
        _id: null,
        totalOutstanding: { $sum: "$totalAmount" }
      }
    }
  ];

  const result = await studentFeeDueModel.aggregate(pipeline);
  return result.length > 0 ? result[0].totalOutstanding : 0;
}
