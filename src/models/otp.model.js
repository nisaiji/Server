import mongoose from "mongoose";
import {
  OTP_TYPE,
  OTP_MEDIUM,
  OTP_ENTITY_TYPE,
  OTP_STATUS
} from "../enums/otp.enums.js";

const otpSchema = mongoose.Schema(
  {
    // value: either phone number or email id
    identifier: {
      type: String,
      required: true
    },
    otp: {
      type: Number,
      maxLength: 5,
      required: true
    },
    expiredAt: {
      type: Number,
      required: true
    },
    otpType: {
      type: String,
      enum: Object.values(OTP_TYPE),
      required: true
    },
    medium: {
      type: String,
      enum: Object.values(OTP_MEDIUM),
      required: true
    },
    entityType: {
      type: String,
      enum: Object.values(OTP_ENTITY_TYPE),
      required: true
    },
    status: {
      type: String,
      enum: Object.values(OTP_STATUS),
      default: OTP_STATUS.PENDING
    }
  },
  {
    timestamps: true
  }
);

const otpModel = mongoose.model("otp", otpSchema);

export default otpModel;
