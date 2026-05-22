import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true,
      index: true,
    },
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "paymentParty",
      required: true,
      index: true,
    },
    paymentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "paymentOrderV2",
      default: null,
    },
    paymentRefNo: {
      type: String,
      required: true,
      trim: true,
    },
    gatewayProvider: {
      type: String,
      enum: ["ZOHO", "RAZORPAY", "CASHFREE", "OFFLINE"],
      required: true,
    },
    gatewayOrderId: {
      type: String,
      default: null,
      trim: true,
    },
    gatewayPaymentId: {
      type: String,
      default: null,
      trim: true,
    },
    externalTxnRef: {
      type: String,
      default: null,
      trim: true,
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    paymentMethod: {
      type: String,
      enum: [
        "UPI",
        "CARD",
        "NETBANKING",
        "CASH",
        "BANK_TRANSFER",
        "CHEQUE",
        "OTHER",
      ],
      required: true,
    },
    channel: {
      type: String,
      enum: ["ONLINE", "OFFLINE"],
      required: true,
    },
    status: {
      type: String,
      enum: ["SUCCEEDED", "FAILED", "REVERSED"],
      required: true,
      index: true,
    },
    succeededAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },
    reversedAt: {
      type: Date,
      default: null,
    },
    receiptStatus: {
      type: String,
      enum: ["NOT_ISSUED", "ISSUED", "VOIDED"],
      default: "NOT_ISSUED",
    },
    createdBy: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ tenantId: 1, paymentRefNo: 1 }, { unique: true });
paymentSchema.index(
  { tenantId: 1, gatewayProvider: 1, gatewayPaymentId: 1 },
  { unique: true, sparse: true }
);
paymentSchema.index({ tenantId: 1, partyId: 1, succeededAt: -1 });

const paymentModel = mongoose.model("paymentCore", paymentSchema, "payments");

export default paymentModel;
