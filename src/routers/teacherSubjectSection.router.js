import express from "express";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";
import { createTeacherSubjectSectionController, deleteTeacherSubjectSectionController, getAllSubjectsOfTeacherInSectionController, getAllSubjectsTeachersOfSectionController, getAllSubjectsTeachersOfSectionForAdminController, updateTeacherSubjectSectionController } from "../controllers/teacherSubjectSection.controller.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";

const teacherSubjectSectionRouter = express.Router();

teacherSubjectSectionRouter.post("/", adminAuthenticate, createTeacherSubjectSectionController );
// teacherSubjectSectionRouter.post("/", teacherAuthenticate, createTeacherSubjectSectionController );
teacherSubjectSectionRouter.get("/teacher", teacherAuthenticate, getAllSubjectsOfTeacherInSectionController);
teacherSubjectSectionRouter.get("/class-teacher", teacherAuthenticate, getAllSubjectsTeachersOfSectionController);
teacherSubjectSectionRouter.get("/admin/:sectionId", adminAuthenticate, getAllSubjectsTeachersOfSectionForAdminController);
teacherSubjectSectionRouter.get("/admin/:teacherSubjectSectionId", adminAuthenticate, getAllSubjectsTeachersOfSectionForAdminController);
teacherSubjectSectionRouter.put("/admin/:teacherSubjectSectionId", adminAuthenticate, updateTeacherSubjectSectionController);
teacherSubjectSectionRouter.delete("/admin/:teacherSubjectSectionId", adminAuthenticate, deleteTeacherSubjectSectionController);

export default teacherSubjectSectionRouter;
