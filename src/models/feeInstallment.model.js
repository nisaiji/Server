import mongoose from "mongoose";

const feeInstallmentSchema = mongoose.Schema({
  feeStructure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'feeStructure',
    required: true
  },
  installmentNumber: {
    type: Number
  },
  amount: {
    type: Number
  },
  startDate: {
    type: Date
  },
  dueDate: {
    type: Number
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
