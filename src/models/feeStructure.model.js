import mongoose from "mongoose";

const feeStructureSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
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
  feeComponents: [{
    name: String,
    amount: Number,
    isOptional: { type: Boolean, default: false }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const feeStructureModel = mongoose.model("feeStructure", feeStructureSchema);
export default feeStructureModel;
