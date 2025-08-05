import express from "express";
import { createAnnouncementByAdminController, createAnnouncementByTeacherController, deleteAnnouncementByAdminController, deleteAnnouncementByTeacherController, getAnnouncementsByAdminController, getAnnouncementsByParentController, getAnnouncementsByTeacherController, getUnReadAnnouncementsCountForParentController, getUnReadAnnouncementsCountForTeacherController, updateAnnouncementByAdminController, updateAnnouncementByTeacherController,  } from "../controllers/announcement.controller.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
import { parentAuthenticate } from "../middlewares/authentication/v2/parent.authentication.middleware.js";

const announcementRouter = express.Router();

announcementRouter.post("/admin", adminAuthenticate,  createAnnouncementByAdminController);
announcementRouter.post("/teacher", teacherAuthenticate,createAnnouncementByTeacherController);
announcementRouter.get("/admin", adminAuthenticate, getAnnouncementsByAdminController);
// announcementRouter.get("/admin/teacher", adminAuthenticate, getTeacherAnnouncementsByAdminController);
announcementRouter.get("/teacher", teacherAuthenticate, getAnnouncementsByTeacherController);
// announcementRouter.get("/teacher/admin", teacherAuthenticate, getAdminAnnouncementsByTeacherController);
announcementRouter.get('/parent', parentAuthenticate, getAnnouncementsByParentController);
announcementRouter.put("/admin/:announcementId", adminAuthenticate, updateAnnouncementByAdminController);
announcementRouter.put("/teacher/:announcementId", teacherAuthenticate, updateAnnouncementByTeacherController);
announcementRouter.delete("/admin/:announcementId", adminAuthenticate, deleteAnnouncementByAdminController);
announcementRouter.delete("/teacher/:announcementId", teacherAuthenticate, deleteAnnouncementByTeacherController);
announcementRouter.get("/teacher/unread", teacherAuthenticate, getUnReadAnnouncementsCountForTeacherController);
announcementRouter.get("/parent/unread", parentAuthenticate, getUnReadAnnouncementsCountForParentController);

export default announcementRouter;
