import mongoose from "mongoose";

const partyBalanceProjectionSchema = new mongoose.Schema(
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
    totalCharges: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    totalAdjustments: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    totalPaidAllocated: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    totalUnallocatedPayments: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    totalRefunded: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    netOutstanding: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    netOpenCredit: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    asOfTimestamp: {
      type: Date,
      required: true,
    },
    rebuiltAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

partyBalanceProjectionSchema.index(
  { tenantId: 1, partyId: 1 },
  { unique: true }
);

const partyBalanceProjectionModel = mongoose.model(
  "partyBalanceProjection",
  partyBalanceProjectionSchema,
  "party_balance_projections"
);

export default partyBalanceProjectionModel;
