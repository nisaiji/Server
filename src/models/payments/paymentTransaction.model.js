import mongoose from "mongoose";

const paymentTransactionSchema = mongoose.Schema({
  paymentLinkId: {
    type: String
  },
  paymentLinkExpiresAt: {
    type: Date
  },
  paymentLinkReferenceId: {
    type: String
  },
  description: {
    type: String
  },
  paymentLinkEmail: {
    type: String
  },
  paymentLinkPhone: {
    type: String
  },
  paymentLinkReturnUrl: {
    type: String
  },
  paymentLinkUrl: {
    type: String
  },
  transactionId: {
    type: String,
    unique: true,
  },
  zohoPaymentId: {
    type: String
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
  amountPaid: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "INR"
  },
  status: {
    type: String,
    enum: ['active', 'paid', 'completed', 'failed', 'refunded'],
    default: 'active'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'netbanking', 'upi', 'wallet']
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  failureReason: {
    type: String
  },
  paidAt: {
    type: Date
  },
  refundedAt: {
    type: Date
  }
}, { timestamps: true });

export default mongoose.model("paymentTransaction", paymentTransactionSchema);
