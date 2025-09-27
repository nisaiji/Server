import express from "express";
import { createStudentExamResultController, getSectionStudentExamMarksController, updateStudentExamResultController } from "../controllers/studentExamResult.controller.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
const studentExamResultRouter = express.Router();

studentExamResultRouter.post("/", createStudentExamResultController);
studentExamResultRouter.post("/section-student-marks",  getSectionStudentExamMarksController)
studentExamResultRouter.put("/:studentExamResultId", updateStudentExamResultController);

export default studentExamResultRouter;
