import mongoose from "mongoose";

const sessionStudentWalletSchema = new mongoose.Schema(
  {
    sessionStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sessionStudent",
      required: true,
      unique: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true,
      index: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true,
      index: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "session",
      required: true,
      index: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCredits: {
      type: Number,
      default: 0,
    },
    totalDebits: {
      type: Number,
      default: 0,
    },
    lastProcessedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const sessionStudentWalletModel = mongoose.model(
  "sessionStudentWallet",
  sessionStudentWalletSchema
);

export default sessionStudentWalletModel;
