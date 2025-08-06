import express from "express";
import { parentAuthenticate } from "../middlewares/authentication/v2/parent.authentication.middleware.js";
import { getStudentLeaveRequestForTeacherController, registerStudentLeaveRequestController } from "../controllers/stuentLeaveRequest.controller.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";

const studentLeaveRequestRouter = express.Router();

studentLeaveRequestRouter.post("/parent", parentAuthenticate, registerStudentLeaveRequestController);
studentLeaveRequestRouter.post("/get-teacher", teacherAuthenticate, getStudentLeaveRequestForTeacherController);

export default studentLeaveRequestRouter;
