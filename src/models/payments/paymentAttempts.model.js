import mongoose from "mongoose";

const paymentAttemptSchema = new mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payment",
      required: true,
      index: true
    },
    gateway: { type: String, enum: ["ZOHO"], default: "ZOHO" },
    checkoutUrl: { type: String },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "EXPIRED", "CANCELLED"],
      default: "PENDING"
    },
    paymentSessionId: { type: String, index: true, sparse: true },
    gatewayResponse: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true, versionKey: false, collection: "payment_attempts" }
);

export default mongoose.model("paymentAttempt", paymentAttemptSchema);
