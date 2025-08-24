import mongoose from "mongoose";

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
    enum: ['admin', 'teacher']
  },
  targetAudience: {
    type: [String],
    enum: ['teacher', 'parent'],
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
    ref:"section"
  }
},
{
   timestamps:true
});

const announcementModel = mongoose.model("announcement",announcementSchema);
export default announcementModel;