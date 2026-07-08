import mongoose from "mongoose";
import { FEE_FREQUENCY } from "../../enums/fee.enums.js";

const FeeCycleSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      required: true,
      index: true
    },

    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sessions",
      required: true,
      index: true
    },

    frequency: {
      type: String,
      enum: Object.values(FEE_FREQUENCY),
      required: true
    },

    dueDate: {
      type: Number,
      required: true,
      min: 1,
      max: 28
    },

    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "feeCycles"
  }
);

FeeCycleSchema.index(
  {
    adminId: 1,
    sessionId: 1
  },
  {
    unique: true
  }
);
const feeCycleModel = mongoose.model("feeCycle", FeeCycleSchema);
export default feeCycleModel;
