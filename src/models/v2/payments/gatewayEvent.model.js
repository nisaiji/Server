import mongoose from "mongoose";

const gatewayEventSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true,
      index: true,
    },
    gatewayProvider: {
      type: String,
      enum: ["ZOHO", "RAZORPAY", "CASHFREE"],
      required: true,
    },
    providerEventId: {
      type: String,
      default: null,
      trim: true,
    },
    providerPaymentId: {
      type: String,
      default: null,
      trim: true,
    },
    providerOrderId: {
      type: String,
      default: null,
      trim: true,
    },
    eventType: {
      type: String,
      required: true,
      trim: true,
    },
    signatureVerified: {
      type: Boolean,
      default: false,
    },
    receivedAt: {
      type: Date,
      required: true,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    processingStatus: {
      type: String,
      enum: ["RECEIVED", "PROCESSED", "FAILED", "IGNORED"],
      default: "RECEIVED",
      index: true,
    },
    rawPayload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: false,
  }
);

gatewayEventSchema.index(
  { tenantId: 1, gatewayProvider: 1, providerEventId: 1 },
  { unique: true, sparse: true }
);
gatewayEventSchema.index({ tenantId: 1, providerPaymentId: 1 });

const gatewayEventModel = mongoose.model(
  "gatewayEventV2",
  gatewayEventSchema,
  "gateway_events"
);

export default gatewayEventModel;
