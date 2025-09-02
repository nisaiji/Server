import express from "express";
import {createSubjectController, deleteSubjectController, getAllSubjectsController, getSubjectsController, getUnassignedSubjectsForSectionController} from "../controllers/subject.controller.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
import { superAdminAuthenticate } from "../middlewares/authentication/superAdmin.authentication.middleware.js";

const subjectRouter = express.Router();

subjectRouter.post("/", superAdminAuthenticate, createSubjectController);
subjectRouter.get("/super-admin", superAdminAuthenticate, getAllSubjectsController);
subjectRouter.get("/admin/:sectionId", adminAuthenticate, getUnassignedSubjectsForSectionController);
subjectRouter.get("/teacher/:sectionId", teacherAuthenticate, getUnassignedSubjectsForSectionController);
subjectRouter.delete("/:subjectId", superAdminAuthenticate, deleteSubjectController);

// subjectRouter.get("/:sessionId", adminAuthenticate, getSubjectsController);
// subjectRouter.get("/:sessionId", teacherAuthenticate, getSubjectsController);

export default subjectRouter;
