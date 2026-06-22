import mongoose from "mongoose";
import { ADMIN_STATUS, ADMIN_STATUS_CHANGE_LOG, ADMIN_RESET_PASSWORD_STATUS } from "../enums/admin.enums.js";

const statusChangeLogSchema = new mongoose.Schema({
  changedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: Object.values(ADMIN_STATUS_CHANGE_LOG),
    required: true
  }
});

const adminSchema = mongoose.Schema({
  username: {
    type: String,
  },
  schoolName: {
    type: String,
  },
  affiliationNo: {
    type: String
  },
  fcmToken: {
    type: String
  },
  principal: {
    type: String
  },
  schoolBoard: {
    type: String
  },
  schoolNumber: {
    type: String
  },
  phone: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  email: {
    type: String,
    lowercase: true,
  },
  status: {
    type: String,
    enum: Object.values(ADMIN_STATUS),
    default: ADMIN_STATUS.UNVERIFIED
  },
  password: {
    type: String,
  },
  address: {
    type: String,
  },
  city: {
    type: String
  },
  district: {
    type: String
  },
  state: {
    type: String
  },
  country: {
    type: String
  },
  photo: {
    type: String
  },
  pincode: {
    type: String
  },
  statusChangeCount: {
    type: Number,
    default: 0
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordStatus: {
    type: String,
    enum: Object.values(ADMIN_RESET_PASSWORD_STATUS),
    default: ADMIN_RESET_PASSWORD_STATUS.EMPTY
  },
  statusChangeLog: [statusChangeLogSchema],

  website: {
    type: String
  },
  facebook: {
    type: String
  },
  instagram: {
    type: String
  },
  linkedin: {
    type: String
  },
  twitter: {
    type: String
  },
  whatsapp: {
    type: String
  },
  youtube: {
    type: String
  },
  merchantPaymentConfig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'merchantPaymentConfig'
  }
},
{
  timestamps: true
}
);

const adminModel = mongoose.model("admin", adminSchema);
export default adminModel;
