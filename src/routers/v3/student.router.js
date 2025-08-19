import express from "express";
import { getAttendancesController, getSessionStudentSController, getStudentWithAllSessionStudentsController, registerSessionStudentController, registerStudentAndSessionStudentController, searchStudentsController, updateStudentByParentController, updateStudentBySchoolController } from "../../controllers/v3/student.controller.js";
import { adminAuthenticate } from "../../middlewares/authentication/admin.authentication.middleware.js";
import { teacherAuthenticate } from "../../middlewares/authentication/teacher.authentication.middleware.js";
import { uploadStudentPhotoValidation } from "../../middlewares/validation/student.validation.middleware.js";
import { validateImageSizeMiddleware } from "../../middlewares/teacher.middleware.js";
import { parentAuthenticate } from "../../middlewares/authentication/parent.authentication.middleware.js";
const studentRouter = express.Router();

studentRouter.post('/admin', adminAuthenticate, registerStudentAndSessionStudentController);
studentRouter.post('/admin/session-student', adminAuthenticate, registerSessionStudentController);

studentRouter.post('/teacher', teacherAuthenticate, registerStudentAndSessionStudentController);
studentRouter.post('/teacher/session-student', teacherAuthenticate, registerSessionStudentController);

studentRouter.put('/admin/:studentId', adminAuthenticate, updateStudentBySchoolController);
studentRouter.put('/teacher/:studentId', teacherAuthenticate, updateStudentBySchoolController);
studentRouter.put("/parent/:studentId", parentAuthenticate, updateStudentByParentController);

studentRouter.put("/parent/photo-upload/:studentId", parentAuthenticate, uploadStudentPhotoValidation, validateImageSizeMiddleware, updateStudentByParentController);
studentRouter.put("/teacher/photo-upload/:studentId", teacherAuthenticate, uploadStudentPhotoValidation, validateImageSizeMiddleware, updateStudentBySchoolController);

studentRouter.get('/get/admin', adminAuthenticate, getSessionStudentSController);
studentRouter.get('/get/teacher', teacherAuthenticate, getSessionStudentSController);

studentRouter.post("/parent/get-attendance", parentAuthenticate, getAttendancesController);

studentRouter.get("/session-students/:studentId", getStudentWithAllSessionStudentsController);

studentRouter.get("/admin", adminAuthenticate, searchStudentsController);
export default studentRouter;
