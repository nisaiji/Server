import mongoose from "mongoose";

const otpSchema = mongoose.Schema({
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
    enum: ['phoneVerification', 'emailVerification', 'forgetPassword'],
    required: true
  },
  medium: {
    type: String,
    enum: ['sms', 'email'],
    required: true
  },
  entityType: {
    type:String,
    enum:["admin", "teacher", "parent"],
    required: true
  },
  status:{
    type:String,
    enum:["pending", "verified", "expired"],
    default: "pending"
  },
},
{
  timestamps:true
}
);

const otpModel = mongoose.model("otp", otpSchema);

export default otpModel;
