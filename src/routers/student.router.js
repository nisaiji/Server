import express from "express";
import {addToSectionStudentController,adminRegisterStudentController,adminUpdateStudentController,deleteStudentController,getAllStudentListForAdminController,getAllStudentOfSectionController,getAllStudentOfSectionForAdminController,getStudentListOfSectionController,parentUpdateStudentController,registerStudentController,searchStudentOfSectionController,updateStudentController} from "../controllers/student.controller.js";
import { adminAuthentication } from "../middlewares/authentication/admin.authentication.middleware.js";
import { classTeacherAuthentication } from "../middlewares/authentication/classTeacher.authentication.middleware.js";
import { parentAuthentication } from "../middlewares/authentication/parent.authentication.middleware.js";
import {addToSectionStudentValidation,deleteStudentValidation,parentUpdateStudentValidation,registerStudentValidation, updateStudentValidation} from "../middlewares/validation/student.validation.middleware.js";

const studentRouter = express.Router();



studentRouter.post("/register",classTeacherAuthentication,registerStudentValidation,registerStudentController);
studentRouter.post("/admin-register",adminAuthentication,registerStudentValidation,adminRegisterStudentController);
studentRouter.delete("/delete/:studentId", classTeacherAuthentication, deleteStudentValidation, deleteStudentController);
studentRouter.delete("/admin-delete/:studentId",adminAuthentication, deleteStudentValidation, deleteStudentController);
studentRouter.get(" /section-students/:sectionId",classTeacherAuthentication,getAllStudentOfSectionController);
studentRouter.get("/admin-section-students/:sectionId",adminAuthentication,getAllStudentOfSectionForAdminController);
studentRouter.get("/all-students/:pageNo",adminAuthentication,getAllStudentListForAdminController);
studentRouter.get("/search/:name",classTeacherAuthentication,searchStudentOfSectionController);
studentRouter.put("/update/:studentId",classTeacherAuthentication,updateStudentValidation, updateStudentController);
studentRouter.put("/admin-update/:studentId",adminAuthentication,updateStudentValidation, updateStudentController);
studentRouter.put("/parent-update/:studentId",parentAuthentication,parentUpdateStudentValidation,parentUpdateStudentController)
studentRouter.put("/upload-photo",);

// studentRouter.put("/admin-update-student/:studentId", adminAuthentication,adminRegisterStudentValidation,adminUpdateStudentController);
// studentRouter.get("/student-list/:sectionId/:pageNo", classTeacherAuthentication, getStudentListOfSectionController);

export default studentRouter; 
