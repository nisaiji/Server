import { getLeaveRequestsForAdminValidation, registerLeaveRequestValidation, updateTeacherLeaveRequestByAdminValidation, updateTeacherLeaveRequestValidation } from "../middlewares/validation/leave.validation.middleware.js";
import { getLeaveRequestsController, registerLeaveRequestController, updateTeacherLeavRequestByAdminController, updateTeacherLeavRequestController } from "../controllers/leave.controller.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
import express from "express";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";

const leaveRouter = express.Router();

leaveRouter.get("/admin", adminAuthenticate, getLeaveRequestsForAdminValidation, getLeaveRequestsController)
leaveRouter.post("/teacher", teacherAuthenticate, registerLeaveRequestValidation, registerLeaveRequestController)
leaveRouter.put("/admin", adminAuthenticate, updateTeacherLeaveRequestByAdminValidation, updateTeacherLeavRequestByAdminController )
leaveRouter.put("/teacher", teacherAuthenticate, updateTeacherLeaveRequestValidation, updateTeacherLeavRequestController )

export default leaveRouter;
