import express from "express";
import { createTeachingEventController, deleteTeachingEventController, getTeachingEventsForTeacherController, updateTeachingEventController } from "../controllers/teachingEvent.controller.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";

const teachingEventRouter = express.Router();
teachingEventRouter.post("/", teacherAuthenticate, createTeachingEventController);
teachingEventRouter.post("/get-teacher", teacherAuthenticate, getTeachingEventsForTeacherController);
teachingEventRouter.put("/teacher/:teachingEventId", teacherAuthenticate, updateTeachingEventController);
teachingEventRouter.delete("/teacher/:teachingEventId", teacherAuthenticate, deleteTeachingEventController);
export default teachingEventRouter;
