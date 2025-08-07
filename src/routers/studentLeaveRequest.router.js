import express from "express";
import { parentAuthenticate } from "../middlewares/authentication/v2/parent.authentication.middleware.js";
import { deleteStudentLeaveRequestByParentController, getStudentLeaveRequestForParentController, getStudentLeaveRequestForTeacherController, registerStudentLeaveRequestController, updateStudentLeaveRequestController } from "../controllers/stuentLeaveRequest.controller.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";

const studentLeaveRequestRouter = express.Router();

studentLeaveRequestRouter.post("/parent", parentAuthenticate, registerStudentLeaveRequestController);
studentLeaveRequestRouter.post("/get-teacher", teacherAuthenticate, getStudentLeaveRequestForTeacherController);
studentLeaveRequestRouter.post("/get-parent", parentAuthenticate, getStudentLeaveRequestForParentController);
studentLeaveRequestRouter.delete("/:requestId", parentAuthenticate, deleteStudentLeaveRequestByParentController);
studentLeaveRequestRouter.put("/parent/:requestId", parentAuthenticate, updateStudentLeaveRequestController);
studentLeaveRequestRouter.put("/teacher/:requestId", teacherAuthenticate, updateStudentLeaveRequestController);

export default studentLeaveRequestRouter;
