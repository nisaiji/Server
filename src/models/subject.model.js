import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    unique: true,
    sparse: true
  },
  description: {
    type: String
  },
  isElective: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const subjectModel =  mongoose.model('Subject', subjectSchema);
export default subjectModel;
