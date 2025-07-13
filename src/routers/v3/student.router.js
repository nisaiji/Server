import express from "express";
import { registerSessionStudentController, registerStudentAndSessionStudentController } from "../../controllers/v3/student.controller.js";
const studentRouter = express.Router();

studentRouter.post('/', registerStudentAndSessionStudentController);
studentRouter.post('/session-student', registerSessionStudentController);
export default studentRouter;
