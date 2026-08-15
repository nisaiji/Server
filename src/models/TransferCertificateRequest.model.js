import mongoose from "mongoose";
import {
  TRANSFER_REQUEST_TYPE,
  TRANSFER_REASON,
  CONDUCT_CHARACTER_RATING,
  TRANSFER_STATUS
} from "../enums/transfer.enums.js";

const transferCertificateRequestSchema = new mongoose.Schema(
  {
    // Student Information
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true
    },
    sessionStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "session_student"
    },

    // Parent/Guardian Information
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "parent",
      required: true
    },
    schoolParent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "school_parent"
    },

    // School Information
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "session",
      required: true
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "class",
      required: true
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "section",
      required: true
    },

    // Request Details
    requestType: {
      type: String,
      enum: Object.values(TRANSFER_REQUEST_TYPE),
      required: true,
      default: TRANSFER_REQUEST_TYPE.TRANSFER
    },
    reason: {
      type: String,
      enum: Object.values(TRANSFER_REASON)
    },
    reasonDescription: {
      type: String,
      maxlength: 500
    },

    // Transfer Details
    lastAttendanceDate: {
      type: Date,
      required: true
    },
    requestedDate: {
      type: Date,
      default: Date.now
    },
    expectedLeavingDate: {
      type: Date
    },
    promotionStatus: {
      type: String
    },

    // New School Information (if transferring)
    newSchoolName: {
      type: String
    },
    newSchoolAddress: {
      type: String
    },
    newSchoolBoard: {
      type: String
    },
    newSchoolAffiliationNo: {
      type: String
    },

    // Conduct and Character
    conduct: {
      type: String,
      enum: Object.values(CONDUCT_CHARACTER_RATING),
      default: CONDUCT_CHARACTER_RATING.GOOD
    },
    character: {
      type: String,
      enum: Object.values(CONDUCT_CHARACTER_RATING),
      default: CONDUCT_CHARACTER_RATING.GOOD
    },
    clearanceStatus: [
      {
        name: {
          type: String,
          required: true
        },
        status: {
          type: Boolean,
          default: false
        }
      }
    ],

    // Request Status and Workflow
    status: {
      type: String,
      enum: Object.values(TRANSFER_STATUS),
      default: TRANSFER_STATUS.SUBMITTED
    },

    // Certificate Details
    certificateNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    certificateGeneratedDate: {
      type: Date
    },
    certificateIssuedDate: {
      type: Date
    },
    certificateIssuedTo: {
      type: String
    },

    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin"
    },
    rejectedDate: {
      type: Date
    },

    // Communication
    parentNotified: {
      type: Boolean,
      default: false
    },
    parentApproved: {
      type: Boolean,
      default: false
    },
    notificationDate: {
      type: Date
    }
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "transfer_certificate_requests"
  }
);

const TransferCertificateRequestModel = mongoose.model(
  "TransferCertificateRequest",
  transferCertificateRequestSchema
);

export default TransferCertificateRequestModel;
