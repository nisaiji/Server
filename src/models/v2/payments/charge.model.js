import mongoose from "mongoose";

const chargeSchema = new mongoose.Schema(
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
    chargeType: {
      type: String,
      enum: [
        "TUITION",
        "ADMISSION",
        "TRANSPORT",
        "MATERIAL",
        "HOSTEL",
        "COACHING_BATCH",
        "TEST_SERIES",
        "OTHER",
      ],
      required: true,
    },
    sourceModule: {
      type: String,
      enum: ["SCHOOL", "COACHING", "MANUAL"],
      required: true,
    },
    sourceRefType: {
      type: String,
      enum: ["INSTALLMENT", "FEE_PLAN", "BATCH_FEE", "ADMISSION_FEE", "MANUAL"],
      required: true,
    },
    sourceRefId: {
      type: String,
      required: true,
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    periodType: {
      type: String,
      enum: ["SESSION", "MONTH", "QUARTER", "BATCH", "CUSTOM"],
      required: true,
    },
    periodRefId: {
      type: String,
      default: null,
    },
    periodLabel: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["POSTED", "PARTIALLY_PAID", "PAID", "CANCELLED"],
      default: "POSTED",
      index: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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

chargeSchema.index(
  { tenantId: 1, sourceRefType: 1, sourceRefId: 1 },
  { unique: true }
);
chargeSchema.index({ tenantId: 1, partyId: 1, dueDate: 1, status: 1 });

const chargeModel = mongoose.model("paymentCharge", chargeSchema, "charges");

export default chargeModel;
