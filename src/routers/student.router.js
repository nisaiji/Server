import express from "express";
import {addToSectionStudentController,adminRegisterStudentController,adminUpdateStudentController,deleteStudentController,getAllStudentListForAdminController,getAllStudentOfSectionController,getStudentListOfSectionController,getStudentListOfSectionForAdminController,registerStudentController,updateStudentController} from "../controllers/student.controller.js";
import { adminAuthentication } from "../middlewares/authentication/admin.authentication.middleware.js";
import { classTeacherAuthentication } from "../middlewares/authentication/classTeacher.authentication.middleware.js";
import {addToSectionStudentValidation,adminRegisterStudentValidation,deleteStudentValidation,registerStudentValidation,} from "../middlewares/validation/student.validation.middleware.js";
import { adminUpdateStudent } from "../services/student.service.js";

const studentRouter = express.Router();

studentRouter.post("/register",classTeacherAuthentication,registerStudentValidation,registerStudentController);
studentRouter.post("/admin-register",adminAuthentication,adminRegisterStudentValidation,adminRegisterStudentController);
studentRouter.delete("/admin-delete/:studentId",adminAuthentication, deleteStudentValidation, deleteStudentController);
studentRouter.delete("/delete-student/:studentId", classTeacherAuthentication, deleteStudentValidation, deleteStudentController);
studentRouter.get("/student-list/:sectionId/:pageNo", classTeacherAuthentication, getStudentListOfSectionController);
studentRouter.get("/student-list/:sectionId",classTeacherAuthentication,getAllStudentOfSectionController);
studentRouter.get("/admin-student-list/:sectionId/:pageNo",adminAuthentication,getStudentListOfSectionForAdminController);
studentRouter.get("/admin-all-student-list/:pageNo",adminAuthentication,getAllStudentListForAdminController);
studentRouter.put("/admin-update-student/:studentId", adminAuthentication,adminUpdateStudentController);
studentRouter.put("/update-student/:studentId",classTeacherAuthentication,updateStudentController);

export default studentRouter;
