import express from "express";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
import { createTagController } from "../controllers/tag.controller.js";

const tagRouter = express.Router();
tagRouter.post("/", teacherAuthenticate, createTagController);
// tagRouter.post("/get-teacher", teacherAuthenticate, getTeachingEventsForTeacherController);
// tagRouter.put("/teacher/:teachingEventId", teacherAuthenticate, updateTeachingEventController);
// tagRouter.delete("/teacher/:teachingEventId", teacherAuthenticate, deleteTeachingEventController);
export default tagRouter;
