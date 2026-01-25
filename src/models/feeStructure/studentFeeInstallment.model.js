import mongoose from "mongoose";

/**
 * unpaid: Future Fees
 * Pending: current month before due date
 * Paid: settled
 * Partial: Current Month partially paid
 * OverDue: Overdue fees
 */
const StatusEnums = ["unpaid", "partial", "paid", "pending", "overdue"];

const studentFeeInstallmentSchema = new mongoose.Schema(
  {
    feeInstallment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "feeInstallment",
      index: true,
      required: true,
    },
    sessionStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sessionStudent",
      index: true,
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      index: true,
      required: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      index: true,
      required: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "session",
      index: true,
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "class",
      index: true,
      required: true,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "section",
      index: true,
      required: true,
    },
    month: { type: Number, required: true },
    // year: { type: Number, required: true },
    baseAmount: { type: Number },
    lateFeeApplied: { type: Number, default: 0 },
    totalPayable: { type: Number },

    amountPaid: { type: Number, default: 0 },
    status: {
      type: String,
      enum: StatusEnums,
      default: "unpaid",
    },
    dueDate: { type: Date, required: true },
    lastLateFeeCalculatedDate: { type: Date }
  },
  {
    timestamps: true,
  }
);

const studentFeeInstallmentModel = mongoose.model(
  "studentFeeInstallment",
  studentFeeInstallmentSchema
);

studentFeeInstallmentModel.createIndexes({ student: 1, session: 1 });
studentFeeInstallmentModel.createIndexes({ dueDate: 1 });
studentFeeInstallmentModel.createIndexes({ status: 1 });
studentFeeInstallmentModel.createIndexes({ feeInstallment: 1 });

export default studentFeeInstallmentModel;
