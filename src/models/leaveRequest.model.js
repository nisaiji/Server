import mongoose from "mongoose";
import {
  LEAVE_SENDER_MODEL,
  LEAVE_RECEIVER_MODEL,
  LEAVE_REQUEST_STATUS
} from "../enums/leave.enums.js";

const leaveRequestSchema = new mongoose.Schema(
  {
    reason: {
      type: String,
      required: true
    },

    description: {
      type: String
    },

    remark: {
      type: String
    },

    sender: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      model: {
        type: String,
        required: true,
        enum: Object.values(LEAVE_SENDER_MODEL)
      }
    },

    receiver: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      model: {
        type: String,
        required: true,
        enum: Object.values(LEAVE_RECEIVER_MODEL)
      }
    },

    status: {
      type: String,
      enum: Object.values(LEAVE_REQUEST_STATUS),
      default: LEAVE_REQUEST_STATUS.PENDING
    },

    startTime: {
      type: Number,
      required: true
    },

    endTime: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "leave_requests"
  }
);

const leaveRequestModel = mongoose.model("leaveRequest", leaveRequestSchema);

export default leaveRequestModel;
