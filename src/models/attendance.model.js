import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: Number,
      required: true
    },
    day: {
      type: String,
      required: true
    },
    teacherAttendance: {
      type: String,
      default: ""
    },
    sessionStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "session_student",
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student"
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
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin"
    }
  },
  { timestamps: true, versionKey: false, collection: "attendances" }
);

const attendanceModel = mongoose.model("attendance", attendanceSchema);
export default attendanceModel;
