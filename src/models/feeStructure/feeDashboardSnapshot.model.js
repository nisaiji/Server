import mongoose from "mongoose";

const feeDashboardSnapshotSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "session",
      required: true,
    },
    generatedAt: { type: Date, default: Date.now },
    totals: {
      collected: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
      overdue: { type: Number, default: 0 },
      refunded: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },

      // week over week %
      collectedChangePct: { type: Number, default: 0 },
      pendingChangePct: { type: Number, default: 0 },
      overdueChangePct: { type: Number, default: 0 },
      refundedChangePct: { type: Number, default: 0 },
      failedChangePct: { type: Number, default: 0 },
    },

    // Per class-section collection, optional
    collectionsByClass: [
      {
        class: { type: String, default: 0 }, // "10"
        section: { type: String, default: 0 }, // "A"
        totalCollected: { type: Number, default: 0 },
      },
    ],
    month: { type: Number },
    isMonthEndRecord: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const feeDashboardSnapshotModel = mongoose.model(
  "feeDashboardSnapshot",
  feeDashboardSnapshotSchema
);

feeDashboardSnapshotModel.createIndexes(
  { school: 1, session: 1 },
  { unique: true }
);

export default feeDashboardSnapshotModel;
