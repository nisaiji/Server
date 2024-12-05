import express from "express";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
import { checkAttendaceMarkedController, getMisMatchAttendanceController, checkParentAttendaceMarkedController, updateAttendanceController, attendanceStatusOfSectionController, attendanceCountOfStudentController, attendanceByTeacherController, attendanceByParentController, attendanceStatusOfStudentController, getAttendancesController } from "../controllers/attendance.controller.js";
import { parentAuthenticate } from "../middlewares/authentication/parent.authentication.middleware.js";
import { attendanceByParentValidation, attendanceByTeacherValidation, attendanceCountValidation, attendanceStatusValidation, getAttendanceValidation, updateAttendanceValidation } from "../middlewares/validation/attendance.validation.middleware.js";
import { authorizeTeacherRoles } from "../middlewares/authorization/teacherRoles.authorization.middleware.js";
 
const attendanceRouter = express.Router();  

attendanceRouter.post("/teacher", teacherAuthenticate, authorizeTeacherRoles('teacher', 'guestTeacher'), attendanceByTeacherValidation, attendanceByTeacherController);
attendanceRouter.post("/parent", parentAuthenticate, attendanceByParentValidation, attendanceByParentController);
attendanceRouter.put("/teacher", teacherAuthenticate, authorizeTeacherRoles('teacher', 'guestTeacher'), updateAttendanceValidation, updateAttendanceController);
attendanceRouter.get("/", getAttendancesController);
attendanceRouter.get("/mismatch", teacherAuthenticate, authorizeTeacherRoles('teacher'), getMisMatchAttendanceController);
attendanceRouter.get("/teacher/is-marked", teacherAuthenticate, authorizeTeacherRoles('teacher', 'guestTeacher'), checkAttendaceMarkedController);
attendanceRouter.get("/parent/is-marked/:studentId", parentAuthenticate, checkParentAttendaceMarkedController);
attendanceRouter.post("/status", teacherAuthenticate, authorizeTeacherRoles('teacher', 'guestTeacher'), attendanceStatusValidation, attendanceStatusOfSectionController);
attendanceRouter.post("/status/:studentId", parentAuthenticate, attendanceStatusValidation, attendanceStatusOfStudentController);
attendanceRouter.post("/parent/count", parentAuthenticate, attendanceCountValidation, attendanceCountOfStudentController)
attendanceRouter.post("/teacher/count", teacherAuthenticate, authorizeTeacherRoles('teacher', 'guestTeacher'), attendanceCountValidation, attendanceCountOfStudentController)



export default attendanceRouter   