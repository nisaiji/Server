import express from "express";
import { createStudentExamResultController, getSectionStudentsExamMarksController, getStudentExamMarksController, getStudentsExamMarksForSubjectController, updateStudentExamResultController } from "../controllers/studentExamResult.controller.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
const studentExamResultRouter = express.Router();

studentExamResultRouter.post("/", createStudentExamResultController);
studentExamResultRouter.post("/student-subject-marks",  getStudentsExamMarksForSubjectController)
studentExamResultRouter.post("/section-student-marks",  getSectionStudentsExamMarksController)
studentExamResultRouter.put("/:studentExamResultId", updateStudentExamResultController);
studentExamResultRouter.post("/parent", getStudentExamMarksController);

export default studentExamResultRouter;
