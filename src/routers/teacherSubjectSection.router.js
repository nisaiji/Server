import express from "express";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";
import { createTeacherSubjectSectionController, getAllSubjectsOfTeacherInSectionController } from "../controllers/teacherSubjectSection.controller.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";

const teacherSubjectSectionRouter = express.Router();

teacherSubjectSectionRouter.post("/", adminAuthenticate, createTeacherSubjectSectionController );
teacherSubjectSectionRouter.post("/", teacherAuthenticate, createTeacherSubjectSectionController );
teacherSubjectSectionRouter.get("/teacher", teacherAuthenticate, getAllSubjectsOfTeacherInSectionController);


export default teacherSubjectSectionRouter;
