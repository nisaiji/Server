import mongoose from "mongoose";
import { VERIFICATION_STATUS } from "../enums/authentication.enums.js";
import { PARENT_GENDER } from "../enums/parent.enums.js";

const parentSchema = new mongoose.Schema(
  {
    username: {
      type: String
    },
    fullName: {
      type: String
    },
    dob: {
      type: String
    },
    gender: {
      type: String,
      enum: Object.values(PARENT_GENDER)
    },
    isActive: {
      type: Boolean,
      default: true
    },
    address: {
      type: String
    },
    photo: {
      type: String
    },
    city: {
      type: String
    },
    district: {
      type: String
    },
    status: {
      type: String,
      enum: Object.values(VERIFICATION_STATUS),
      default: VERIFICATION_STATUS.UNVERIFIED
    },
    fcmToken: {
      type: String
    },
    country: {
      type: String
    },
    pincode: {
      type: String
    },
    qualification: {
      type: String
    },
    occupation: {
      type: String
    },
    isLoginAlready: {
      type: Boolean,
      default: false
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      lowercase: true
    },
    password: {
      type: String
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "student"
      }
    ]
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "parents"
  }
);
// parentSchema.index({ phone: 1, isActive: 1 }, { unique: true });

const parentModel = mongoose.model("parent", parentSchema);

export default parentModel;
