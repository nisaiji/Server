import mongoose from "mongoose";

const sessionStudentSchema = mongoose.Schema({
  rollNumber: {
    type: Number
  },
  enrollmentStatus: {
    type: String,
    enum: ['newAdmission', 'promoted', 'failed']
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "student",
    required: true
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
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin"
  },
  exams: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  tests: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  transferCertificateIssued: {
    type: Boolean,
    default: false
  },
  transferCertificateIssuedAt: {
    type: Date
  },
  feeStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid'],
    default: 'pending'
  },
  feeDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  scholorship: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
},
{
  timestamps:true
}
);

const sessionStudentModel = mongoose.model("sessionStudent", sessionStudentSchema);
export default sessionStudentModel;