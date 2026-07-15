import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import {
  initiatePaymentFlow as initiatePaymentFlowService,
  validateSessionStudentOwnership
} from "./paymentInitiation.service.js";
import studentFeeDueModel from "../../models/fee/studentFeeDue.model.js";
import ledgerEntryModel from "../../models/payments/ledgerEntries.model.js";
import paymentModel from "../../models/payments/payment.model.js";
import paymentAttemptModel from "../../models/payments/paymentAttempts.model.js";
import receiptModel from "../../models/payments/receipt.model.js";
import { getSessionStudentService } from "../sessionStudent.service.js";

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
        { paymentId: payment._id, status: { $in: ["PENDING", "EXPIRED"] } },
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
      gatewayResponse
    }
  );

  await paymentAttemptModel.updateMany(
    { paymentId: payment._id, status: "PENDING" },
    { status: "FAILED", paymentSessionId, gatewayResponse }
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
      { new: true }
    ),
    paymentAttemptModel.updateMany(
      { paymentId, status: "PENDING" },
      { status: "CANCELLED" }
    )
  ]);

  console.info("Payment cancelled successfully.", { paymentId });
  return updatedPayment;
}
