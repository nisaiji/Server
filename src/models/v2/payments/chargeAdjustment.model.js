import mongoose from "mongoose";

const chargeAdjustmentSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true,
      index: true,
    },
    chargeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "paymentCharge",
      required: true,
      index: true,
    },
    adjustmentType: {
      type: String,
      enum: [
        "CONCESSION",
        "WAIVER",
        "REVERSAL",
        "MANUAL_REDUCTION",
        "MANUAL_INCREASE",
      ],
      required: true,
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    effectiveDate: {
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
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

chargeAdjustmentSchema.index({ tenantId: 1, chargeId: 1, status: 1 });

const chargeAdjustmentModel = mongoose.model(
  "chargeAdjustmentV2",
  chargeAdjustmentSchema,
  "charge_adjustments"
);

export default chargeAdjustmentModel;
