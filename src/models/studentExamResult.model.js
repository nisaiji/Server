import mongoose from "mongoose";

const examResultSchema = new mongoose.Schema({
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
        enum: ["marks", "grades"],
      },
      examType: {
        type: String,
        enum: ["theory", "practical", "grade"],
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
        enum: ["pass", "fail", "absent", "pending"], 
        default: "pending"
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
}, { timestamps: true });

// Unique per exam-student-subject
// examResultSchema.index({ exam: 1, sessionStudent: 1, subject: 1 }, { unique: true });

const studentExamResultModel = mongoose.model("studentExamResult", examResultSchema);

export default studentExamResultModel;
