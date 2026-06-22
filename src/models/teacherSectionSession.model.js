import mongoose from "mongoose";
const teacherSectionSessionSchema = mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
      required: true
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "section",
      required: true
    },
    classInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "class",
      required: true
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "session",
      required: true
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true
    }
  },
  {
    timestamps: true
  }
);

const teacherSectionSessionModel = mongoose.model(
  "teacherSectionSession",
  teacherSectionSessionSchema
);

export default teacherSectionSessionModel;
