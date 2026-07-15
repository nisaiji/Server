import mongoose from "mongoose";

const ledgerEntrySchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      required: true,
      index: true
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payment",
      required: true,
      index: true
    },
    sessionStudentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "students",
      required: true
    },
    account: { type: String, required: true },
    type: { type: String, enum: ["DEBIT", "CREDIT"], required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true, versionKey: false, collection: "ledger_entries" }
);

export default mongoose.model("ledgerEntry", ledgerEntrySchema);
