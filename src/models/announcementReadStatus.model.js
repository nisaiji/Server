import { ANNOUNCEMENT_TARGET_AUDIENCE } from "@src/enums/announcement.enums.js";
import mongoose from "mongoose";

const announcementReadStatusSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "userRole",
      required: true
    },
    userRole: {
      type: String,
      enum: Object.values(ANNOUNCEMENT_TARGET_AUDIENCE),
      required: true
    },
    announcement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "announcement",
      required: true
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "announcement_reads_statuses"
  }
);

announcementReadStatusSchema.index(
  { userId: 1, announcementId: 1 },
  { unique: true }
);

const announcementReadStatusModel = mongoose.model(
  "announcementReadStatus",
  announcementReadStatusSchema
);
export default announcementReadStatusModel;
