import mongoose from "mongoose";

const allocationSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true,
      index: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "paymentCore",
      required: true,
      index: true,
    },
    chargeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "paymentCharge",
      required: true,
      index: true,
    },
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "paymentParty",
      required: true,
      index: true,
    },
    allocatedAmount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    allocationType: {
      type: String,
      enum: ["MANUAL", "EXACT_MATCH", "AUTO_BASIC", "AUTO_FIFO", "ADVANCE_APPLY"],
      required: true,
    },
    effectiveAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "REVERSED"],
      default: "ACTIVE",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    reversedBy: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    reversedAt: {
      type: Date,
      default: null,
    },
    reversalReason: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

allocationSchema.index({ tenantId: 1, paymentId: 1, status: 1 });
allocationSchema.index({ tenantId: 1, chargeId: 1, status: 1 });

const allocationModel = mongoose.model(
  "paymentAllocation",
  allocationSchema,
  "allocations"
);

export default allocationModel;
