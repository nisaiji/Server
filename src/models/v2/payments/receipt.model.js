import mongoose from "mongoose";

const receiptSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true,
      index: true,
    },
    receiptNumber: {
      type: String,
      required: true,
      trim: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "paymentCore",
      required: true,
      index: true,
    },
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "paymentParty",
      required: true,
      index: true,
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    issuedAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["ISSUED", "VOIDED"],
      default: "ISSUED",
      index: true,
    },
    voidReason: {
      type: String,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

receiptSchema.index({ tenantId: 1, receiptNumber: 1 }, { unique: true });
receiptSchema.index({ tenantId: 1, paymentId: 1 }, { unique: true });

const receiptModel = mongoose.model("paymentReceipt", receiptSchema, "receipts");

export default receiptModel;
