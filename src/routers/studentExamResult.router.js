import express from "express";
import { createOrUpdateBulkStudentExamResultController, createStudentExamResultController, getSectionStudentsExamMarksController, getStudentExamMarksController, getStudentExamMarksForSubjectController, getStudentsExamMarksForSubjectController, updateStudentExamResultController } from "../controllers/studentExamResult.controller.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";
import { parentAuthenticate } from "../middlewares/authentication/parent.authentication.middleware.js";
const studentExamResultRouter = express.Router();

studentExamResultRouter.post("/", createStudentExamResultController);
studentExamResultRouter.post("/teacher", teacherAuthenticate, createOrUpdateBulkStudentExamResultController);
studentExamResultRouter.post("/admin", adminAuthenticate, createOrUpdateBulkStudentExamResultController);
studentExamResultRouter.post("/student-subject-marks",  getStudentsExamMarksForSubjectController)
studentExamResultRouter.post("/section-student-marks",  getSectionStudentsExamMarksController)
studentExamResultRouter.post("/parent-student-marks", parentAuthenticate, getStudentExamMarksController);
studentExamResultRouter.post("/parent-student-subject-marks", parentAuthenticate, getStudentExamMarksForSubjectController);
studentExamResultRouter.put("/:studentExamResultId", updateStudentExamResultController);
    
export default studentExamResultRouter;
