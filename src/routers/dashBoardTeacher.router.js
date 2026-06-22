import express from "express";

import { attendanceStatusOfSectionController } from "../controllers/dashboardTeacher.controller.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
import { attendancesStatusValidation } from "../middlewares/validation/dashboardTeacher.validation.middleware.js";

const teacherDashboardRouter = express.Router();

teacherDashboardRouter.post(
  "/attendance-status",
  teacherAuthenticate,
  attendancesStatusValidation,
  attendanceStatusOfSectionController
);

export default teacherDashboardRouter;
