import mongoose from "mongoose";

const feeStructureSchema = mongoose.Schema({
  name: {
    type: String,
  },
  description: {
    type: String
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'section',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "class",
    required: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'session',
    required: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'admin',
    required: true
  },
  installmentType: {
    type: String,
    enum: ['monthly', 'bimonthly', 'quarterly', 'half-yearly', 'annually'],
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lateFee: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const feeStructureModel = mongoose.model("feeStructure", feeStructureSchema);
export default feeStructureModel;
