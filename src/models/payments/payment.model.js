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
    status: {
      type: String,
      enum: ["CREATED", "PENDING", "SUCCESS", "FAILED"],
      default: "CREATED",
      index: true
    },
    paidAt: { type: Date },
    gatewayResponse: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true, versionKey: false, collection: "payments" }
);

export default mongoose.model("payment", paymentSchema);
