import express from "express";
import { createStudentExamResultController } from "../controllers/studentExamResult.controller.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
const studentExamResultRouter = express.Router();

studentExamResultRouter.post("/", createStudentExamResultController);

export default studentExamResultRouter;
