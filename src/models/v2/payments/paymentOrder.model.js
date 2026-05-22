import mongoose from "mongoose";

const paymentOrderSchema = new mongoose.Schema(
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
    orderRefNo: {
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
    requestedAmount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    payableSelectionMode: {
      type: String,
      enum: ["SINGLE_CHARGE", "MULTI_CHARGE", "OPEN_CREDIT"],
      required: true,
    },
    selectedChargeIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "paymentCharge",
      },
    ],
    status: {
      type: String,
      enum: ["CREATED", "PENDING", "PAID", "FAILED", "EXPIRED", "CANCELLED"],
      default: "CREATED",
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    initiatedBy: {
      type: String,
      enum: ["PARENT", "ADMIN", "SYSTEM"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

paymentOrderSchema.index({ tenantId: 1, orderRefNo: 1 }, { unique: true });
paymentOrderSchema.index(
  { tenantId: 1, gatewayProvider: 1, gatewayOrderId: 1 },
  { unique: true, sparse: true }
);

const paymentOrderModel = mongoose.model(
  "paymentOrderV2",
  paymentOrderSchema,
  "payment_orders"
);

export default paymentOrderModel;
