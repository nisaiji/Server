import express from "express";
import { createExambyAdminController, getExamsForSectionController, getSectionExamsForTeacherController, getStudentExamsForParentController, updateExamController } from "../controllers/exam.controller.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
import { parentAuthenticate } from "../middlewares/authentication/parent.authentication.middleware.js";
const examRouter = express.Router();

examRouter.post("/", adminAuthenticate, createExambyAdminController);
examRouter.get('/:sectionId', adminAuthenticate, getExamsForSectionController);
examRouter.post('/teacher', teacherAuthenticate, getSectionExamsForTeacherController);
examRouter.post('/parent', parentAuthenticate, getStudentExamsForParentController);
examRouter.put('/:examId', adminAuthenticate, updateExamController);

export default examRouter;
