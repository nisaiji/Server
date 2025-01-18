import mongoose from "mongoose";

const statusChangeLogSchema = new mongoose.Schema({
  changedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['activated', 'deactivated'],
    required: true
  }
});

export default statusChangeLogSchema;