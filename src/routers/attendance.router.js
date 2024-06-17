import express from "express";
import { classTeacherAuthentication } from "../middlewares/authentication/classTeacher.authentication.middleware.js";
import { classTeacherAuthorization } from "../middlewares/authorization/classTeacher.authorization.middleware.js";
import { markPresentValidation } from "../middlewares/validation/attendance.validation.middleware.js";
import { markAttendanceController,checkAttendaceMarkedController,attendanceDailyStatusController, attendanceWeeklyStatusController, attendanceMonthlyStatusController } from "../controllers/attendance.controller.js";

const attendanceRouter = express.Router();

/**
 * @swagger
 * /attendance/mark-attendance:
 *   post:
 *     security:
 *       - Authorization: []
 *     summary: to mark the attendance of student
 *     description: This API will mark the attendance of a student,if already marked then it will update, but before it ensure class teacher is authentic and authorized.it requires classTeacher login token.
 *     tags:
 *       - Attendance
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *               sectionId:
 *                 type: string
 *               isPresent:
 *                 type: string
 *     responses:
 *       200:
 *         description: "attendance marked successfully"
 *       400:
 *         description: "Unauthorized!"
 *       500:
 *         description: "Server side error"
 */
// attendanceRouter.post("/mark-attendance", classTeacherAuthentication,markPresentValidation,classTeacherAuthorization,markAttendanceController);

attendanceRouter.post("/mark-attendance/:sectionId", classTeacherAuthentication,markAttendanceController);

attendanceRouter.get("/check-attendance-marked/:sectionId",classTeacherAuthentication,checkAttendaceMarkedController);

attendanceRouter.get("/daily-status/:sectionId",classTeacherAuthentication,attendanceDailyStatusController);

attendanceRouter.get("/weekly-status/:sectionId",classTeacherAuthentication,attendanceWeeklyStatusController);

attendanceRouter.get("/monthly-status/:sectionId",classTeacherAuthentication,attendanceMonthlyStatusController);

export default attendanceRouter;