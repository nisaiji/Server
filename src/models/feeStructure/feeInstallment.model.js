import mongoose from "mongoose";

const feeInstallmentSchema = mongoose.Schema({
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
    type: Date
  },
  sectionFeeStructure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sectionFeeStructure',
    required: true
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'section'
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
  }
}, { timestamps: true });

const feeInstallmentModel = mongoose.model("feeInstallment", feeInstallmentSchema);
export default feeInstallmentModel;