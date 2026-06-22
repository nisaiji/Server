import mongoose from "mongoose";
import { SESSION_STATUS } from "../enums/session.enums.js";

const sessionSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
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
    enum: Object.values(SESSION_STATUS),
    default: SESSION_STATUS.ACTIVE
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
  timestamps: true
}
);

const sessionModel = mongoose.model("session", sessionSchema);
export default sessionModel;
