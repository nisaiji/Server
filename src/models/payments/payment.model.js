import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      required: true,
      index: true
    },
    sessionStudentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sessionStudents",
      required: true
    },
    feeDueIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "studentFeeDue",
        required: true
      }
    ],
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    gateway: { type: String, enum: ["ZOHO"], default: "ZOHO" },
    paymentSessionId: { type: String, index: true, sparse: true },
    zohoWebhookPaymentId: { type: String },
    paymentMethod: {
      type: String
    },
    status: {
      type: String,
      enum: ["CREATED", "PENDING", "SUCCESS", "FAILED", "EXPIRED", "CANCELLED"],
      default: "CREATED"
    },
    paymentHash: {
      type: String
    },
    statusUpdatedAt: { type: Date },
    expiresAt: { type: Date },
    gatewayResponse: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true, versionKey: false, collection: "payments" }
);

paymentSchema.index({
  sessionStudentId: 1,
  status: 1
});

paymentSchema.index({
  paymentHash: 1,
  status: 1
});

paymentSchema.index(
  { paymentHash: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: ["CREATED", "PENDING", "SUCCESS"]
      }
    }
  }
);
export default mongoose.model("payment", paymentSchema);
