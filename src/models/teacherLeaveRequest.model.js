import mongoose from "mongoose";
import { LEAVE_REQUEST_STATUS } from "../enums/leave.enums.js";

const teacherLeaveRequestSchema = mongoose.Schema(
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

    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "section",
      required: true
    },

    requestingTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
      required: true
    },

    guestTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
      required: true
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin"
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
    timestamps: true
  }
);

const teacherLeaveRequestModel = mongoose.model(
  "teacherLeaveRequest",
  teacherLeaveRequestSchema
);

export default teacherLeaveRequestModel;
