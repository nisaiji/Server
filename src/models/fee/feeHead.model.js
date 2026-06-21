import mongoose from "mongoose";

const FeeHeadSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      required: true,
      index: true,
    },

    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sessions",
      required: true,
      index: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    feeHeads: [
      {
        name: {
          type: String,
          required: true,
        },
        label: {
          type: String,
          required: true,
        },

        type: {
          type: String,
          enum: ["RECURRING", "ONE_TIME"],
          required: true,
        },

        refundable: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

FeeHeadSchema.index({ adminId: 1, sessionId: 1 }, { unique: true });

const feeHeadModel = mongoose.model("feeHead", FeeHeadSchema);
export default feeHeadModel;
