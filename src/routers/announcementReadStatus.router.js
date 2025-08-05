import express from 'express';
import { markAnnouncementsAsReadForParentController, markAnnouncementsAsReadForTeacherController } from "../controllers/announcementReadStatus.controller.js";
const announcementReadStatusRouter = express.Router();

announcementReadStatusRouter.post("/parent/mark-as-read",  markAnnouncementsAsReadForParentController);
announcementReadStatusRouter.post("/teacher/mark-as-read", markAnnouncementsAsReadForTeacherController);

export default announcementReadStatusRouter;