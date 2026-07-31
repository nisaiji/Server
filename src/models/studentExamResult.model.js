import mongoose from "mongoose";
import {
  GRADING_TYPE,
  COMPONENT_EXAM_TYPE,
  EXAM_RESULT_STATUS
} from "../enums/exam.enums.js";

const examResultSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "exam",
      required: true
    },
    sessionStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sessionStudent",
      required: true
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subject",
      required: true
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
        marksObtained: {
          type: Number
        },
        maxMarks: {
          type: Number
        },
        gradeObtained: {
          type: String
        },
        status: {
          type: String,
          enum: Object.values(EXAM_RESULT_STATUS),
          default: EXAM_RESULT_STATUS.PENDING
        },
        isAbsent: {
          type: Boolean,
          default: false
        },
        attempt: {
          type: Number,
          default: 1
        },
        teacherRemarks: {
          type: String
        },
        evaluatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "teacher"
        }
      }
    ],

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin"
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    publishedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "student_exam_results"
  }
);

// Unique per exam-student-subject
// examResultSchema.index({ exam: 1, sessionStudent: 1, subject: 1 }, { unique: true });

const studentExamResultModel = mongoose.model(
  "studentExamResult",
  examResultSchema
);

export default studentExamResultModel;
