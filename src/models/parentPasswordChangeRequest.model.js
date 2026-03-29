import mongoose from "mongoose";

const parentPasswordChangeRequestSchema = new mongoose.Schema({
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parent',
    required: true
  },
  reason: {
    type: String,
    enum: ["forgetPassword", "changeDevice", "technical", "other"],
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ["pending", "expired", "completed"],
    default: "pending"
  }
}, {
  timestamps: true
});

const parentPasswordChangeRequestModel = mongoose.model('ParentPasswordChangeRequest', parentPasswordChangeRequestSchema);
export default parentPasswordChangeRequestModel;