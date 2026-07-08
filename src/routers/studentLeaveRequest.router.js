import express from "express";
import {
  deleteStudentLeaveRequestByParentController,
  getStudentLeaveRequestForParentController,
  getStudentLeaveRequestForTeacherController,
  registerStudentLeaveRequestController,
  updateStudentLeaveRequestByTeacherController,
  updateStudentLeaveRequestController
} from "../controllers/studentLeaveRequest.controller.js";
import { parentAuthenticate } from "../middlewares/authentication/parent.authentication.middleware.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
import { authorizeTeacherRoles } from "../middlewares/authorization/teacherRoles.authorization.middleware.js";

const studentLeaveRequestRouter = express.Router();

studentLeaveRequestRouter.post(
  "/parent",
  parentAuthenticate,
  registerStudentLeaveRequestController
);
studentLeaveRequestRouter.post(
  "/get-teacher",
  teacherAuthenticate,
  authorizeTeacherRoles("classTeacher"),
  getStudentLeaveRequestForTeacherController
);
studentLeaveRequestRouter.post(
  "/get-parent",
  parentAuthenticate,
  getStudentLeaveRequestForParentController
);
studentLeaveRequestRouter.delete(
  "/:requestId",
  parentAuthenticate,
  deleteStudentLeaveRequestByParentController
);
studentLeaveRequestRouter.put(
  "/parent/:requestId",
  parentAuthenticate,
  updateStudentLeaveRequestController
);
studentLeaveRequestRouter.put(
  "/teacher/:requestId",
  teacherAuthenticate,
  authorizeTeacherRoles("classTeacher"),
  updateStudentLeaveRequestByTeacherController
);

export default studentLeaveRequestRouter;
