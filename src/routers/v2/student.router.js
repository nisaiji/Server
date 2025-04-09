import express from "express";
import { adminAuthenticate } from "../../middlewares/authentication/admin.authentication.middleware.js";
import { registerStudentController, searchStudentsController, updateStudentBySchoolController } from "../../controllers/v2/student.controller.js";

const studentRouter = express.Router();

studentRouter.get('/admin', searchStudentsController)
studentRouter.post('/', adminAuthenticate, registerStudentController)
studentRouter.put('/:studentId', adminAuthenticate, updateStudentBySchoolController)
export default studentRouter;
