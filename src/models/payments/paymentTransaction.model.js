import mongoose from "mongoose";

const paymentTransactionSchema = mongoose.Schema({
  paymentLinkId: {
    type: String
  },
  paymentSessionId: {
    type: String
  },
  paymentLinkExpiresAt: {
    type: Date
  },
  paymentSessionExpiresAt: {
    type: Date
  },
  paymentReferenceId: {
    type: String
  },
  paymentInvoiceId: {
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
    type: String
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
  feeInstallment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "feeInstallment",
  },
  amount: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number
  },
  currency: {
    type: String,
    default: "INR"
  },
  status: {
    type: String,
    enum: ['active','sessionInitiated', 'paid', 'failed'],
    default: 'active'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'net_banking', 'upi', 'default']
  },
  failureCode: {
    type: String
  },
  failureCategory: {
    type: String
  },
  failureTip: {
    type: String
  },
  failureReason: {
    type: String
  },
  paidAt: {
    type: Date
  },
  refundedAt: {
    type: Date
  },
  // webhook related fields
  webhookId: {
    type: String
  },
  webhookType: {
    type: String
  },
  webhookAccountId: {
    type: String
  },
  webhookEventTime: {
    type: String
  }
}, { timestamps: true });

const paymentTransactionModel = mongoose.model("paymentTransaction", paymentTransactionSchema);
export default paymentTransactionModel;
