import express from "express";
import { createAnnouncementByAdminController, createAnnouncementByTeacherController, getAnnouncementsByAdminController, getAnnouncementsByParentController, getAnnouncementsByTeacherController,  } from "../controllers/announcement.controller.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
import { parentAuthenticate } from "../middlewares/authentication/v2/parent.authentication.middleware.js";

const announcementRouter = express.Router();

announcementRouter.post("/admin", adminAuthenticate,  createAnnouncementByAdminController);
announcementRouter.post("/teacher", teacherAuthenticate,createAnnouncementByTeacherController);
announcementRouter.get("/admin", adminAuthenticate, getAnnouncementsByAdminController);
announcementRouter.get("/teacher", teacherAuthenticate, getAnnouncementsByTeacherController);
announcementRouter.get('/parent', parentAuthenticate, getAnnouncementsByParentController);

export default announcementRouter;
