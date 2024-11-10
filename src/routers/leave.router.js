import { registerLeaveRequestValidation } from "../middlewares/validation/leave.validation.middleware.js";
import { getLeaveRequestsController, registerLeaveRequestController } from "../controllers/leave.controller.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
import express from "express";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";

const leaveRouter = express.Router();

leaveRouter.get("/admin", adminAuthenticate, getLeaveRequestsController)
leaveRouter.post("/teacher", registerLeaveRequestValidation, teacherAuthenticate, registerLeaveRequestController)

export default leaveRouter;