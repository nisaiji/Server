import express from "express";
import { createStudentExamResultController, getSectionStudentsExamMarksController, getStudentsExamMarksForSubjectController, updateStudentExamResultController } from "../controllers/studentExamResult.controller.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
const studentExamResultRouter = express.Router();

studentExamResultRouter.post("/", createStudentExamResultController);
studentExamResultRouter.post("/student-subject-marks",  getStudentsExamMarksForSubjectController)
studentExamResultRouter.post("/section-student-marks",  getSectionStudentsExamMarksController)
studentExamResultRouter.put("/:studentExamResultId", updateStudentExamResultController);

export default studentExamResultRouter;
