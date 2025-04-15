import express from "express";
import { adminAuthenticate } from "../../middlewares/authentication/admin.authentication.middleware.js";
import { registerStudentController, registerStudentsFromExcelController, searchStudentsController, updateStudentBySchoolController } from "../../controllers/v2/student.controller.js";
import upload from "../../middlewares/multer.middleware.js";
import { teacherAuthenticate } from "../../middlewares/authentication/teacher.authentication.middleware.js";

const studentRouter = express.Router();

studentRouter.get('/admin', adminAuthenticate, searchStudentsController)
studentRouter.post('/teacher', teacherAuthenticate, registerStudentController)
studentRouter.put('/:studentId', adminAuthenticate, updateStudentBySchoolController)
studentRouter.post('/bulk', adminAuthenticate, upload, registerStudentsFromExcelController )

export default studentRouter;
