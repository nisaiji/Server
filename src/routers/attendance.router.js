import express from "express";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
import { checkAttendaceMarkedController, getMisMatchAttendanceController, checkParentAttendaceMarkedController, updateAttendanceController, attendanceStatusOfSectionController, attendanceCountOfStudentController, attendanceByTeacherController, attendanceByParentController, attendanceStatusOfStudentController, getAttendancesController, bulkAttendanceMarkController, undoAttendanceByTeacherController } from "../controllers/attendance.controller.js";
import { parentAuthenticate } from "../middlewares/authentication/parent.authentication.middleware.js";
import { attendanceByParentValidation, attendanceByTeacherValidation, attendanceCountValidation, attendanceStatusValidation, getAttendanceValidation, updateAttendanceValidation } from "../middlewares/validation/attendance.validation.middleware.js";
import { authorizeTeacherRoles } from "../middlewares/authorization/teacherRoles.authorization.middleware.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";

const attendanceRouter = express.Router();

attendanceRouter.post("/teacher", teacherAuthenticate, authorizeTeacherRoles('teacher', 'guestTeacher'), attendanceByTeacherValidation, attendanceByTeacherController);
attendanceRouter.post("/parent", parentAuthenticate, attendanceByParentValidation, attendanceByParentController);
attendanceRouter.put("/teacher", teacherAuthenticate, authorizeTeacherRoles('teacher', 'guestTeacher'), updateAttendanceValidation, updateAttendanceController);
attendanceRouter.post("/teacher/bulk-mark/:sectionId", teacherAuthenticate, bulkAttendanceMarkController)
attendanceRouter.post("/admin/bulk-mark/:sectionId", adminAuthenticate, bulkAttendanceMarkController)
attendanceRouter.get("/admin", adminAuthenticate, getAttendancesController);
attendanceRouter.get("/teacher", teacherAuthenticate, getAttendancesController);
attendanceRouter.get("/mismatch", teacherAuthenticate, authorizeTeacherRoles('teacher'), getMisMatchAttendanceController);
attendanceRouter.get("/teacher/is-marked", teacherAuthenticate, authorizeTeacherRoles('teacher', 'guestTeacher'), checkAttendaceMarkedController);
attendanceRouter.get("/parent/is-marked/:studentId", parentAuthenticate, checkParentAttendaceMarkedController);
attendanceRouter.post("/status", teacherAuthenticate, authorizeTeacherRoles('teacher', 'guestTeacher'), attendanceStatusValidation, attendanceStatusOfSectionController);
attendanceRouter.post("/status/:studentId", parentAuthenticate, attendanceStatusValidation, attendanceStatusOfStudentController);
attendanceRouter.post("/parent/count", parentAuthenticate, attendanceCountValidation, attendanceCountOfStudentController)
attendanceRouter.post("/teacher/count", teacherAuthenticate, authorizeTeacherRoles('teacher', 'guestTeacher'), attendanceCountValidation, attendanceCountOfStudentController)
attendanceRouter.post("/teacher/undoAttendance", teacherAuthenticate, authorizeTeacherRoles('teacher'), undoAttendanceByTeacherController)

export default attendanceRouter
