import express from "express";
import {addToSectionStudentController,adminRegisterStudentController,adminUpdateStudentController,deleteStudentController,getAllStudentListForAdminController,getAllStudentOfSectionController,getAllStudentOfSectionForAdminController,getStudentListOfSectionController,registerStudentController,updateStudentController} from "../controllers/student.controller.js";
import { adminAuthentication } from "../middlewares/authentication/admin.authentication.middleware.js";
import { classTeacherAuthentication } from "../middlewares/authentication/classTeacher.authentication.middleware.js";
import {addToSectionStudentValidation,deleteStudentValidation,registerStudentValidation} from "../middlewares/validation/student.validation.middleware.js";
// import { adminUpdateStudent } from "../services/student.service.js";

const studentRouter = express.Router();

studentRouter.post("/register",classTeacherAuthentication,registerStudentValidation,registerStudentController);
studentRouter.post("/admin-register",adminAuthentication,registerStudentValidation,adminRegisterStudentController);
studentRouter.delete("/delete/:studentId", classTeacherAuthentication, deleteStudentValidation, deleteStudentController);
studentRouter.delete("/admin-delete/:studentId",adminAuthentication, deleteStudentValidation, deleteStudentController);
studentRouter.get(" /section-students/:sectionId",classTeacherAuthentication,getAllStudentOfSectionController);
studentRouter.get("/admin-section-students/:sectionId",adminAuthentication,getAllStudentOfSectionForAdminController);
studentRouter.get("/all-students/:pageNo",adminAuthentication,getAllStudentListForAdminController);
studentRouter.put("/update-student/:studentId",classTeacherAuthentication,updateStudentController);
// studentRouter.put("/admin-update-student/:studentId", adminAuthentication,adminRegisterStudentValidation,adminUpdateStudentController);
// studentRouter.get("/student-list/:sectionId/:pageNo", classTeacherAuthentication, getStudentListOfSectionController);

export default studentRouter;
