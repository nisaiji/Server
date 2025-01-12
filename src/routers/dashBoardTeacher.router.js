import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
import express from "express";
import { attendancesStatusValidation } from "../middlewares/validation/dashboardTeacher.validation.middleware.js";
import { attendanceStatusOfSectionController } from "../controllers/dashboardTeacher.controller.js";

const teacherDashboardRouter = express.Router();

teacherDashboardRouter.post("/attendance-status",teacherAuthenticate, attendancesStatusValidation, attendanceStatusOfSectionController);

export default teacherDashboardRouter;
