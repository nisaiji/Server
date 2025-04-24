import express from "express";
import { adminAuthenticate } from "../../middlewares/authentication/admin.authentication.middleware.js";
import { registerStudentController, registerStudentsFromExcelController, searchStudentsController, updateStudentByParentController, updateStudentBySchoolController } from "../../controllers/v2/student.controller.js";
import upload from "../../middlewares/multer.middleware.js";
import { teacherAuthenticate } from "../../middlewares/authentication/teacher.authentication.middleware.js";
import { parentAuthenticate } from "../../middlewares/authentication/v2/parent.authentication.middleware.js";
import { uploadStudentPhotoValidation } from "../../middlewares/validation/student.validation.middleware.js";
import { validateImageSizeMiddleware } from "../../middlewares/teacher.middleware.js";

const studentRouter = express.Router();

studentRouter.get('/admin', adminAuthenticate, searchStudentsController)
studentRouter.post('/admin', adminAuthenticate, registerStudentController)
studentRouter.post('/teacher', teacherAuthenticate, registerStudentController)
studentRouter.put('/:studentId', adminAuthenticate, updateStudentBySchoolController)
studentRouter.post('/bulk', adminAuthenticate, upload, registerStudentsFromExcelController )
studentRouter.put("/parent/photo-upload/:studentId", parentAuthenticate, uploadStudentPhotoValidation, validateImageSizeMiddleware, updateStudentByParentController)
studentRouter.put("/parent/:studentId", parentAuthenticate, updateStudentByParentController)


export default studentRouter;
