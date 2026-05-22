import mongoose from "mongoose";

const tenantFeatureConfigSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true,
      index: true,
    },
    tier: {
      type: String,
      enum: ["BASIC", "ADVANCED"],
      default: "BASIC",
    },
    collectionEnabled: {
      type: Boolean,
      default: true,
    },
    manualAllocationEnabled: {
      type: Boolean,
      default: true,
    },
    exactChargePaymentOnly: {
      type: Boolean,
      default: true,
    },
    unallocatedCreditAllowed: {
      type: Boolean,
      default: false,
    },
    walletEnabled: {
      type: Boolean,
      default: false,
    },
    lateFeeEngineEnabled: {
      type: Boolean,
      default: false,
    },
    concessionEngineEnabled: {
      type: Boolean,
      default: false,
    },
    autoFifoAllocationEnabled: {
      type: Boolean,
      default: false,
    },
    refundMode: {
      type: String,
      enum: ["MANUAL", "GATEWAY"],
      default: "MANUAL",
    },
    effectiveFrom: {
      type: Date,
      required: true,
      default: Date.now,
    },
    effectiveTo: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

tenantFeatureConfigSchema.index(
  { tenantId: 1, effectiveFrom: 1 },
  { unique: true }
);
tenantFeatureConfigSchema.index({ tenantId: 1, tier: 1 });

const tenantFeatureConfigModel = mongoose.model(
  "tenantFeatureConfigV2",
  tenantFeatureConfigSchema,
  "tenant_feature_configs"
);

export default tenantFeatureConfigModel;
