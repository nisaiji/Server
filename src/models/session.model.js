import mongoose from "mongoose";

const sessionSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin"
  },
  isCurrent: {
    type: Boolean,
    default: false 
  },
  status: {
    type: String,
    enum: ["upcoming", "active", 'completed'],
    default: "active"
  },
  academicStartYear: {
    type: Number,
    required: true
  },
  academicEndYear: {
    type: Number,
    required: true
  }
},
{
  timestamps:true
}
);

const sessionModel = mongoose.model("session", sessionSchema);
export default sessionModel;
