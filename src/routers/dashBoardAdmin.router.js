import express from "express"
import { getHolidayEventsOfMonthController, getParentCountController, getPresentStudentsController, getTeacherCountController } from "../controllers/dashboardAdmin.controller.js";
import { adminAuthentication } from "../middlewares/authentication/admin.authentication.middleware.js";

const adminDashboardRouter = express.Router();

adminDashboardRouter.get("/present-students",adminAuthentication,getPresentStudentsController);
adminDashboardRouter.get("/parent-count",adminAuthentication,getParentCountController);
adminDashboardRouter.get("/teacher-count",adminAuthentication,getTeacherCountController);
adminDashboardRouter.post("/holiday-events",adminAuthentication,getHolidayEventsOfMonthController);

export default adminDashboardRouter;