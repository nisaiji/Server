import mongoose from "mongoose";
import {
  PASSWORD_CHANGE_REASON,
  PARENT_PASSWORD_CHANGE_STATUS
} from "../enums/password.enums.js";

const parentPasswordChangeRequestSchema = new mongoose.Schema(
  {
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parent",
      required: true
    },
    reason: {
      type: String,
      enum: Object.values(PASSWORD_CHANGE_REASON),
      required: true
    },
    description: {
      type: String
    },
    status: {
      type: String,
      enum: Object.values(PARENT_PASSWORD_CHANGE_STATUS),
      default: PARENT_PASSWORD_CHANGE_STATUS.PENDING
    }
  },
  {
    timestamps: true
  }
);

const parentPasswordChangeRequestModel = mongoose.model(
  "ParentPasswordChangeRequest",
  parentPasswordChangeRequestSchema
);
export default parentPasswordChangeRequestModel;
