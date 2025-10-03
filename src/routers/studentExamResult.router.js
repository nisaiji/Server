import express from "express";
import { createOrUpdateBulkStudentExamResultController, createStudentExamResultController, getSectionStudentsExamMarksController, getStudentExamMarksController, getStudentsExamMarksForSubjectController, updateStudentExamResultController } from "../controllers/studentExamResult.controller.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";
const studentExamResultRouter = express.Router();

studentExamResultRouter.post("/", createStudentExamResultController);
studentExamResultRouter.post("/teacher", teacherAuthenticate, createOrUpdateBulkStudentExamResultController);
studentExamResultRouter.post("/admin", adminAuthenticate, createOrUpdateBulkStudentExamResultController);
studentExamResultRouter.post("/student-subject-marks",  getStudentsExamMarksForSubjectController)
studentExamResultRouter.post("/section-student-marks",  getSectionStudentsExamMarksController)
studentExamResultRouter.put("/:studentExamResultId", updateStudentExamResultController);
studentExamResultRouter.post("/get-parent", getStudentExamMarksController);

export default studentExamResultRouter;
