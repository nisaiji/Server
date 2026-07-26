import mongoose from "mongoose";
import {
  EXAM_TYPE,
  EXAM_MODE,
  SUBJECT_TYPE,
  GRADING_TYPE,
  COMPONENT_EXAM_TYPE,
  EXAM_STATUS
} from "../enums/exam.enums.js";

const examSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "session",
      required: true
    },
    classInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "class",
      required: true
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "section",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    type: {
      type: String,
      enum: Object.values(EXAM_TYPE)
    },
    academicYear: {
      type: String
    },
    mode: {
      type: String,
      enum: Object.values(EXAM_MODE),
      default: EXAM_MODE.OFFLINE
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    subjects: [
      {
        subject: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "subject",
          required: true
        },
        subjectType: {
          type: String,
          enum: Object.values(SUBJECT_TYPE)
        },
        components: [
          {
            gradingType: {
              type: String,
              enum: Object.values(GRADING_TYPE)
            },
            examType: {
              type: String,
              enum: Object.values(COMPONENT_EXAM_TYPE)
            },
            maxMarks: { type: Number },
            maxGrade: { type: String },
            passingMarks: { type: Number },
            passingGrade: { type: String }
          }
        ]
      }
    ],
    timeTable: [
      {
        subject: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "subject"
        },
        date: {
          type: Date
        },
        startTime: {
          type: String
        },
        endTime: {
          type: String
        },
        examAddress: {
          type: String
        }
      }
    ],
    weightage: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: Object.values(EXAM_STATUS),
      default: EXAM_STATUS.SCHEDULED
    },
    resultPublished: {
      type: Boolean,
      default: false
    },
    resultPublishedAt: {
      type: Date
    },
    remarks: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true, versionKey: false, collection: "exams" }
);

const examModel = mongoose.model("exam", examSchema);
export default examModel;
