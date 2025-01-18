import express from "express"
import { attendanceStatusController, attendanceStatusOfSectionController, getParentCountController, getPresentStudentsController, getTeacherCountController } from "../controllers/dashboardAdmin.controller.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";
import { attendancesStatusValidation, presentStudentsOfSchoolValidation } from "../middlewares/validation/dashboardAdmin.validation.middleware.js";

const adminDashboardRouter = express.Router();

adminDashboardRouter.post("/present-students", adminAuthenticate, presentStudentsOfSchoolValidation, getPresentStudentsController);
adminDashboardRouter.get("/parent-count", adminAuthenticate, getParentCountController);
adminDashboardRouter.get("/teacher-count", adminAuthenticate, getTeacherCountController);
adminDashboardRouter.post("/attendance-status",adminAuthenticate, attendancesStatusValidation ,attendanceStatusController);
adminDashboardRouter.post("/attendance-status/:sectionId",adminAuthenticate, attendancesStatusValidation ,attendanceStatusOfSectionController);

export default adminDashboardRouter;
