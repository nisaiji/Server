import mongoose from "mongoose";

const receiptSchema = new mongoose.Schema(
  {
    receiptNo: { type: String, required: true, unique: true },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      required: true,
      index: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "students",
      required: true
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payment",
      required: true,
      unique: true
    },
    feeDueIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "studentFeeDue" }],
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    issuedAt: { type: Date, default: Date.now }
  },
  { timestamps: true, versionKey: false, collection: "receipts" }
);

export default mongoose.model("receipt", receiptSchema);
