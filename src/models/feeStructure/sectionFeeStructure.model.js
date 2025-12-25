import mongoose from "mongoose";

const sectionFeeStructureSchema = mongoose.Schema({
  title: {
    type: String
  },
  description: {
    type: String
  },
  totalAmount: {
    type: Number,
    required: true
  },
  schoolFeeStructure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'schoolFeeStructure'
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
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const sectionFeeStructureModel = mongoose.model("sectionFeeStructure", sectionFeeStructureSchema);
export default sectionFeeStructureModel;
