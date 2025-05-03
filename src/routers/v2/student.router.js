import express from "express";
import { adminAuthenticate } from "../../middlewares/authentication/admin.authentication.middleware.js";
import { registerStudentController, registerStudentsFromExcelController, searchStudentsController, updateStudentByParentController, updateStudentBySchoolController, getAttendancesController, getStudentsController, updateStudentController, deleteStudentController } from "../../controllers/v2/student.controller.js";
import upload from "../../middlewares/multer.middleware.js";
import { teacherAuthenticate } from "../../middlewares/authentication/teacher.authentication.middleware.js";
import { parentAuthenticate } from "../../middlewares/authentication/v2/parent.authentication.middleware.js";
import { uploadStudentPhotoValidation } from "../../middlewares/validation/student.validation.middleware.js";
import { validateImageSizeMiddleware } from "../../middlewares/teacher.middleware.js";
import { authorizeTeacherRoles } from "../../middlewares/authorization/teacherRoles.authorization.middleware.js";

const studentRouter = express.Router();

studentRouter.get('/admin-get', adminAuthenticate, getStudentsController )
studentRouter.get('/teacher-get', teacherAuthenticate, getStudentsController )
studentRouter.put('/admin/:studentId', adminAuthenticate, updateStudentController)
studentRouter.put('/teacher/:studentId', teacherAuthenticate, updateStudentController)
studentRouter.get('/admin', adminAuthenticate, searchStudentsController)
studentRouter.post('/admin', adminAuthenticate, registerStudentController)
studentRouter.post('/teacher', teacherAuthenticate, registerStudentController)
studentRouter.put('/:studentId', adminAuthenticate, updateStudentBySchoolController)
studentRouter.post('/bulk', adminAuthenticate, upload, registerStudentsFromExcelController )
studentRouter.put("/parent/photo-upload/:studentId", parentAuthenticate, uploadStudentPhotoValidation, validateImageSizeMiddleware, updateStudentByParentController)
studentRouter.put("/teacher/photo-upload/:studentId", teacherAuthenticate, uploadStudentPhotoValidation, validateImageSizeMiddleware, updateStudentController)
studentRouter.put("/parent/:studentId", parentAuthenticate, updateStudentByParentController)
studentRouter.post("/parent/get-attendance", parentAuthenticate, getAttendancesController)
studentRouter.delete("/teacher/:studentId", teacherAuthenticate, authorizeTeacherRoles('teacher'), deleteStudentController );
studentRouter.delete("/admin/:studentId", adminAuthenticate, deleteStudentController );

export default studentRouter;
