import mongoose from "mongoose";
import {
  ENROLLMENT_STATUS,
  FEE_STATUS
} from "../enums/sessionStudent.enums.js";

const sessionStudentSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: Number
    },
    enrollmentStatus: {
      type: String,
      enum: Object.values(ENROLLMENT_STATUS)
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "section"
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "class"
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "session"
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin"
    },
    transferCertificateIssued: {
      type: Boolean,
      default: false
    },
    transferCertificateIssuedAt: {
      type: Date
    },
    feeStatus: {
      type: String,
      enum: Object.values(FEE_STATUS),
      default: FEE_STATUS.PENDING
    },
    feeDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "session_students"
  }
);

sessionStudentSchema.index({ student: 1, session: 1 }, { unique: true });

const sessionStudentModel = mongoose.model(
  "sessionStudent",
  sessionStudentSchema
);
export default sessionStudentModel;
