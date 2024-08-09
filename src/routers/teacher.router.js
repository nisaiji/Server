import express from "express";
import {registerTeacherController,deleteTeacherController, loginClassTeacherController, getAllClassTeachersController,  getTeacherListController,  updateTeacherController, updateClassTeacherController,  getTeachersController,  getUnassignedTeacherController, authUpdateTeacherController, profileUpdateTeacherController, changePasswordTeacherController, authInfoUpdateTeacherController, updloadPhotoTeacherController } from "../controllers/teacher.controller.js";
import { adminAuthentication } from "../middlewares/authentication/admin.authentication.middleware.js";
import { classTeacherAuthentication } from "../middlewares/authentication/classTeacher.authentication.middleware.js";
import {authInfoUpdateTeacherValidation, authUpdateTeacherValidation, deleteTeacherValidation, loginClassTeacherValidation,markTeacherAsClassTeacherValidation, profileUpdateTeacherValidation, registerTeacherValidation, updateClassTeacherValidation, updateTeacherValidation} from "../middlewares/validation/teacher.validation.middleware.js";
 
const teacherRouter = express.Router();

teacherRouter.post("/register", adminAuthentication, registerTeacherValidation,  registerTeacherController);
teacherRouter.post("/login",loginClassTeacherValidation,loginClassTeacherController);
teacherRouter.get("/all",adminAuthentication,getAllClassTeachersController);
teacherRouter.put("/auth-update",classTeacherAuthentication,authUpdateTeacherValidation,authUpdateTeacherController); 
teacherRouter.put("/auth-info-update",classTeacherAuthentication,authInfoUpdateTeacherValidation,authInfoUpdateTeacherController); 
teacherRouter.put("/profile-update",classTeacherAuthentication,profileUpdateTeacherValidation,profileUpdateTeacherController); 
teacherRouter.put("/admin-class-teacher/:teacherId",adminAuthentication,updateClassTeacherValidation, updateClassTeacherController);
teacherRouter.delete("/:teacherId",adminAuthentication,deleteTeacherValidation,deleteTeacherController);
teacherRouter.get("/get/:teacherId", adminAuthentication, getTeachersController);
teacherRouter.get("/teacher-list",adminAuthentication,getTeacherListController);
teacherRouter.get("/unassigned-teachers",adminAuthentication, getUnassignedTeacherController);
teacherRouter.put("/admin-teacher/:teacherId", adminAuthentication,registerTeacherValidation, updateTeacherController);
teacherRouter.put("/password-change", classTeacherAuthentication, changePasswordTeacherController);
teacherRouter.put("/photo-upload",classTeacherAuthentication,updloadPhotoTeacherController);
teacherRouter.post("/forget-password")


export default teacherRouter;


