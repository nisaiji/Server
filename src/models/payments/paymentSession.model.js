import mongoose from "mongoose";

const paymentSessionSchema = mongoose.Schema({
  paymentSessionId: {
    type: String,
    unique: true,
    required: true
  },
  sessionStudent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "sessionStudent",
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'student',
    required: true
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'section',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'class',
    required: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'session',
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "parent",
    required: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
    required: true
  },
  feeStructure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "feeStructure",
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "INR"
  },
  invoiceNumber: {
    type: String,
    unique: true,
  },
  referenceNumber: {
    type: String,
    unique: true,
  },
  status: {
    type: String,
    enum: ['pending','paymentSessionCreated', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  validTill: {
    type: Date
  }
}, { timestamps: true });

export default mongoose.model("paymentSession", paymentSessionSchema);
