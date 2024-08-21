import express from "express"
import { getHolidayEventsOfMonthController, getParentCountController, getPresentStudentsController, getTeacherCountController, monthlyAttendanceOfSchoolController, weeklyAttendanceOfSchoolController } from "../controllers/dashboardAdmin.controller.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";

const adminDashboardRouter = express.Router();

adminDashboardRouter.get("/present-students",adminAuthenticate,getPresentStudentsController);
adminDashboardRouter.get("/parent-count",adminAuthenticate,getParentCountController);
adminDashboardRouter.get("/teacher-count",adminAuthenticate,getTeacherCountController);
adminDashboardRouter.post("/holiday-events",adminAuthenticate,getHolidayEventsOfMonthController);
adminDashboardRouter.get("/weekly-attendance/:sectionId",adminAuthenticate,weeklyAttendanceOfSchoolController);
adminDashboardRouter.get("/monthly-attendance/:sectionId",adminAuthenticate,monthlyAttendanceOfSchoolController);

export default adminDashboardRouter;