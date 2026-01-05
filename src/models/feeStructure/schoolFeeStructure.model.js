import mongoose from "mongoose";

const schoolFeeStructureSchema = mongoose.Schema({
  title: {
    type: String
  },
  description: {
    type: String
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
  lateFeePercent: {
    type: Number,
    default: 0
  },
  installmentType: {
    type: String,
    enum: ['monthly', 'bimonthly', 'quarterly', 'half-yearly', 'annually'],
    required: true
  },
  effectiveFrom: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const schoolFeeStructureModel = mongoose.model("schoolFeeStructure", schoolFeeStructureSchema);
export default schoolFeeStructureModel;
