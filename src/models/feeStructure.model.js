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
    required: true,
    index: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "class",
    required: true,
    index: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'session',
    required: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'admin',
    required: true,
    index: true
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
  },
  academicYearId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'academicYear',
    required: true,
    index: true
  },
  effectiveFrom: {
    type: Date,
    required: true
  },
}, { timestamps: true });


feeStructureSchema.index({ school: 1, academicYearId: 1, classId: 1, section: 1, name: 1 }, { unique: false });

const feeStructureModel = mongoose.model("feeStructure", feeStructureSchema);
export default feeStructureModel;
