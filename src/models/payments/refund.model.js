import mongoose from "mongoose";

const refundSchema = mongoose.Schema({
  refundId: {
    type: String,
    required: true,
    unique: true
  },
  paymentId: {
    type: String,
    required: true
  },
  referenceNumber: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "INR"
  },
  type: {
    type: String,
    enum: ['initiated_by_merchant', 'initiated_by_customer', 'initiated_by_system'],
    required: true
  },
  reason: {
    type: String,
    enum: ['requested_by_customer', 'duplicate', 'fraudulent', 'subscription_canceled', 'product_unsatisfactory', 'product_not_received', 'unrecognized', 'credit_not_processed', 'general', 'product_unacceptable', 'transaction_unauthorized', 'other'],
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['initiated', 'succeeded', 'failed', 'cancelled', 'pending'],
    required: true
  },
  networkReferenceNumber: {
    type: String
  },
  failureReason: {
    type: String
  },
  refundDate: {
    type: Date
  },
  paymentTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "paymentTransaction"
  },
  feeInstallment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "feeInstallment"
  },
  sessionStudent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "sessionStudent"
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'student'
    },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "parent"
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "session"
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
    required: true
  },
  // Webhook fields
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
  },
  webhookProcessed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const refundModel = mongoose.model("refund", refundSchema);
export default refundModel;
