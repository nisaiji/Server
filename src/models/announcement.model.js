import mongoose from "mongoose";
import { ANNOUNCEMENT_CREATOR_ROLE, ANNOUNCEMENT_TARGET_AUDIENCE } from "../enums/announcement.enums.js";

const announcementSchema = new mongoose.Schema({
  title: {
    type: String
  },
  description: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'createdByRole'
  },
  createdByRole: {
    type: String,
    required: true,
    enum: Object.values(ANNOUNCEMENT_CREATOR_ROLE)
  },
  targetAudience: {
    type: [String],
    enum: Object.values(ANNOUNCEMENT_TARGET_AUDIENCE),
    required: true
  },
  startsAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "section"
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "session"
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin"
  }
},
{
  timestamps: true
});

const announcementModel = mongoose.model("announcement", announcementSchema);
export default announcementModel;
