import mongoose from "mongoose";

const guestTeacherSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  deviceId: {
    type: String
  },
  isLoginAlready:{
    type:Boolean,
    default:false
  },
  tagline: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  endTime: {
    type: Number,
    required: true
  },
  leaveRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "leaveRequest",
    required: true
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "section",
    required: true
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
    required: true
  },
});

const guestTeacherModel = mongoose.model("guestTeacher", guestTeacherSchema);

export default guestTeacherModel;
