import express from "express";
import { adminRegisterStudentController, deleteStudentController, getAllStudentListForAdminController, getAllStudentOfSectionController, getAllStudentOfSectionForAdminController, getStudentListOfSectionController,
  parentUpdateStudentController, registerStudentController, searchStudentForAdminController, searchStudentOfSectionController, studentParentUpdateStudentController, updateStudentController, uploadStudentPhotoController } from "../controllers/student.controller.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
import { parentAuthenticate } from "../middlewares/authentication/parent.authentication.middleware.js";
import {deleteStudentValidation, registerStudentValidation, studentParentUpdateStudentValidation, updateStudentByAdminValidation, updateStudentByParentValidation, updateStudentByTeacherValidation } from "../middlewares/validation/student.validation.middleware.js";

const studentRouter = express.Router();

studentRouter.post("/teacher", teacherAuthenticate, registerStudentValidation, registerStudentController );
studentRouter.post("/admin", adminAuthenticate, registerStudentValidation, adminRegisterStudentController );
studentRouter.delete("/teacher/:studentId", teacherAuthenticate, deleteStudentValidation, deleteStudentController );
studentRouter.delete("/admin/:studentId", adminAuthenticate, deleteStudentValidation, deleteStudentController );
studentRouter.get("/teacher-section/:sectionId", teacherAuthenticate, getAllStudentOfSectionController );
studentRouter.get("/admin-section/:sectionId", adminAuthenticate, getAllStudentOfSectionForAdminController );
studentRouter.get("/:pageNo", adminAuthenticate, getAllStudentListForAdminController );
studentRouter.get("/teacher/search/:name", teacherAuthenticate, searchStudentOfSectionController );
studentRouter.get("/admin/search/:name", adminAuthenticate, searchStudentForAdminController );
studentRouter.put("/photo-upload/:studentId", parentAuthenticate, uploadStudentPhotoController );
     
studentRouter.put("/teacher/:studentId", teacherAuthenticate, updateStudentByTeacherValidation, updateStudentController );
studentRouter.put("/admin/:studentId", adminAuthenticate, updateStudentByAdminValidation, updateStudentController );
studentRouter.put("/parent/:studentId", parentAuthenticate, updateStudentByParentValidation, parentUpdateStudentController );
studentRouter.put("/student-parent-update/:studentId", adminAuthenticate, studentParentUpdateStudentValidation, studentParentUpdateStudentController );
  
export default studentRouter;
