import mongoose from "mongoose";

const feeLedgerSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true,
    },
    sessionStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sessionStudent",
      required: true,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "paymentTransaction",
    },

    // incoming money
    amount: { type: Number },
    // remaining balance
    unadjustedAmount: { type: Number },

    type: { type: String, enum: ["payment", "refund"] },
  },
  {
    timestamps: true,
  }
);

const feeLedgerModel = mongoose.model("feeLedger", feeLedgerSchema);

feeLedgerModel.createIndexes({ student: 1 });
feeLedgerModel.createIndexes({ type: 1 });

export default feeLedgerModel;
