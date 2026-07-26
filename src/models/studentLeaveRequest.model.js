import mongoose from "mongoose";
import { LEAVE_REQUEST_STATUS } from "../enums/leave.enums.js";

const studentLeaveRequestSchema = new mongoose.Schema(
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

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "parent"
    },

    sessionStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sessionStudent"
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student"
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher"
    },

    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "section"
    },

    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin"
    },

    status: {
      type: String,
      enum: Object.values(LEAVE_REQUEST_STATUS),
      default: LEAVE_REQUEST_STATUS.PENDING
    },

    isRead: {
      type: Boolean,
      default: false
    },

    startDate: {
      type: Number,
      required: true
    },

    endDate: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "student_leave_requests"
  }
);

const studentLeaveRequestModel = mongoose.model(
  "studentLeaveRequest",
  studentLeaveRequestSchema
);
export default studentLeaveRequestModel;
