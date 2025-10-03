import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
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
    enum: ["test", "exam"], 
  },
  academicYear: { 
    type: String, 
  },
  mode: { 
    type: String, 
    enum: ["online", "offline", "both"], 
    default: "offline" 
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
        enum: ["mainSubject","gradeOnlySubject"]
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
    enum: ["scheduled", "ongoing", "completed", "cancelled"], 
    default: "scheduled" 
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
}, { timestamps: true });

const examModel = mongoose.model('exam', examSchema);
export default examModel;
