import express from "express";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
import { checkAttendaceMarkedController, getMisMatchAttendanceController, checkParentAttendaceMarkedController, updateAttendanceController, attendanceStatusOfSectionController, attendanceCountOfStudentController, attendanceByTeacherController, attendanceByParentController } from "../controllers/attendance.controller.js";
import { parentAuthenticate } from "../middlewares/authentication/parent.authentication.middleware.js";
import { markAttendanceByTeacherValidation } from "../middlewares/validation/teacher.validation.middleware.js";
 
const attendanceRouter = express.Router();  

attendanceRouter.post("/teacher", teacherAuthenticate, attendanceByTeacherController);
attendanceRouter.post("/parent",parentAuthenticate,attendanceByParentController);
attendanceRouter.put("/teacher", teacherAuthenticate,updateAttendanceController);
attendanceRouter.get("/mismatch",teacherAuthenticate,getMisMatchAttendanceController);
attendanceRouter.get("/teacher/is-marked",teacherAuthenticate,checkAttendaceMarkedController);
attendanceRouter.get("/parent/is-marked/:studentId",parentAuthenticate,checkParentAttendaceMarkedController);
attendanceRouter.get("/status",teacherAuthenticate,attendanceStatusOfSectionController);
attendanceRouter.post("/parent/count",parentAuthenticate,attendanceCountOfStudentController)
attendanceRouter.post("/teacher/count",teacherAuthenticate,attendanceCountOfStudentController)

export default attendanceRouter 