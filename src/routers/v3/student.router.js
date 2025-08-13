import express from "express";
import { registerSessionStudentController, registerStudentAndSessionStudentController } from "../../controllers/v3/student.controller.js";
import { adminAuthenticate } from "../../middlewares/authentication/admin.authentication.middleware.js";
const studentRouter = express.Router();

studentRouter.post('/', adminAuthenticate, registerStudentAndSessionStudentController);
studentRouter.post('/session-student', adminAuthenticate, registerSessionStudentController);
export default studentRouter;
