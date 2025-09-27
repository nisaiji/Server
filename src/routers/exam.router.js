import express from "express";
import { createExamController, getExamsForSectionController } from "../controllers/exam.controller.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
const examRouter = express.Router();

examRouter.post("/", adminAuthenticate, createExamController);
examRouter.get('/:sectionId', adminAuthenticate, getExamsForSectionController);
examRouter.get('/:sectionId', teacherAuthenticate, getExamsForSectionController);

export default examRouter;
