import express from "express";
import { classTeacherAuthentication } from "../middlewares/authentication/classTeacher.authentication.middleware.js";
import { classTeacherAuthorization } from "../middlewares/authorization/classTeacher.authorization.middleware.js";
import { markPresentValidation } from "../middlewares/validation/attendance.validation.middleware.js";
import { markAttendanceController,checkAttendaceMarkedController,attendanceDailyStatusController, attendanceWeeklyStatusController, attendanceMonthlyStatusController, parentMarkAttendanceController, getMisMatchAttendanceController, parentMonthlyAttendanceStatusController, checkParentAttendaceMarkedController } from "../controllers/attendance.controller.js";
import { parentAuthentication } from "../middlewares/authentication/parent.authentication.middleware.js";

const attendanceRouter = express.Router(); 

attendanceRouter.post("/mark-attendance/:sectionId", classTeacherAuthentication,markAttendanceController);
attendanceRouter.post("/parent-mark-attendance/",parentAuthentication,parentMarkAttendanceController);
attendanceRouter.put("/update-attendance/", classTeacherAuthentication,markAttendanceController);
attendanceRouter.get("/mismatch-attendance/:sectionId",classTeacherAuthentication,getMisMatchAttendanceController);
attendanceRouter.get("/check-attendance-marked/:sectionId",classTeacherAuthentication,checkAttendaceMarkedController);
attendanceRouter.get("/check-parent-attendance-marked/:studentId",parentAuthentication,checkParentAttendaceMarkedController);
attendanceRouter.get("/daily-status/:sectionId",classTeacherAuthentication,attendanceDailyStatusController);
attendanceRouter.get("/weekly-status/:sectionId",classTeacherAuthentication,attendanceWeeklyStatusController);
attendanceRouter.get("/monthly-status/:sectionId",classTeacherAuthentication,attendanceMonthlyStatusController);
attendanceRouter.get("/parent-monthly-attendance-status/:studentId/:month",parentAuthentication,parentMonthlyAttendanceStatusController)


export default attendanceRouter