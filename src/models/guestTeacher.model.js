import mongoose from "mongoose";

const guestTeacherSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true
    },
    isLoginAlready: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: false
    },
    tagline: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    secretKey: {
      type: String,
      required: true
    },
    startTime: {
      type: Number,
      required: true
    },
    endTime: {
      type: Number,
      required: true
    },
    leaveRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "leave_request",
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
    }
  },
  { timestamps: true, versionKey: false, collection: "guest_teachers" }
);

const guestTeacherModel = mongoose.model("guestTeacher", guestTeacherSchema);

export default guestTeacherModel;
