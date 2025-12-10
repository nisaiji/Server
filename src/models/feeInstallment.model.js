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
  }
}, { timestamps: true });

const feeInstallmentModel = mongoose.model("feeInstallment", feeInstallmentSchema);
export default feeInstallmentModel;
