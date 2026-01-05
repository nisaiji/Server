import mongoose from "mongoose";

const feeInstallmentSchema = mongoose.Schema({
  installmentNumber: {
    type: Number
  },
  amount: {
    type: Number
  },
  startDate: {
    type: Number
  },
  dueDate: {
    type: Number
  },
  sectionFeeStructure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sectionFeeStructure',
    required: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'session'
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'school'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'student',
    required: true,
    index: true
  },
  academicYearId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'academicYear',
    required: true,
    index: true
  },
  // once due date passes, principal amount is locked and cannot be changed
  lockedPrincipal: {
    type: Boolean,
    default: false
  },
  metaData: {
    type: Object
  }
}, { timestamps: true });

feeInstallmentSchema.index({ studentId: 1, academicYearId: 1, dueDate: 1 });

const feeInstallmentModel = mongoose.model("feeInstallment", feeInstallmentSchema);
export default feeInstallmentModel;