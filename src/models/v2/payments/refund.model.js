import mongoose from "mongoose";

const refundSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true,
      index: true,
    },
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "paymentParty",
      required: true,
      index: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "paymentCore",
      default: null,
      index: true,
    },
    refundRefNo: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    refundMode: {
      type: String,
      enum: ["MANUAL", "GATEWAY"],
      default: "MANUAL",
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["INITIATED", "SUCCEEDED", "FAILED", "CANCELLED"],
      required: true,
      index: true,
    },
    gatewayRefundId: {
      type: String,
      default: null,
      trim: true,
    },
    initiatedAt: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
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

refundSchema.index({ tenantId: 1, refundRefNo: 1 }, { unique: true });
refundSchema.index({ tenantId: 1, partyId: 1, initiatedAt: -1 });

const refundModel = mongoose.model(
  "paymentRefundCore",
  refundSchema,
  "payment_core_refunds"
);

export default refundModel;
