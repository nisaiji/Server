import mongoose from "mongoose";

const webhookEventSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      index: true
    },
    gateway: {
      type: String,
      enum: ["ZOHO"],
      required: true,
      index: true
    },
    gatewayEventId: {
      type: String,
      required: true,
      unique: true
    },
    eventType: {
      type: String,
      required: true,
      index: true
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    processingStatus: {
      type: String,
      enum: ["PENDING", "PROCESSED", "FAILED"],
      default: "PENDING",
      index: true
    },
    processingError: { type: String },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payment",
      index: true
    }
  },
  { timestamps: true, versionKey: false, collection: "webhook_events" }
);

export default mongoose.model("webhookEvent", webhookEventSchema);
