import mongoose from "mongoose";

const sectionAttendanceSchema = new mongoose.Schema(
  {
    date: {
      type: Number,
      required: true
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "section"
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher"
    },
    presentCount: {
      type: Number,
      default: 0
    },
    absentCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["completed", "pending"],
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "section_attendances"
  }
);

const sectionAttendanceModel = mongoose.model(
  "sectionAttendance",
  sectionAttendanceSchema
);
export default sectionAttendanceModel;
