import express from "express";
import {registerTeacherController,deleteTeacherController,  updateTeacherController, changePasswordTeacherController, loginTeacherController, getAllTeacherOfAdminController, getTeacherController, getAllNonSectionTeacherController } from "../controllers/teacher.controller.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
import {emailPhoneUpdateTeacherValidation, loginTeacherValidation, photoUpdateTeacherValidation, registerTeacherValidation, updateTeacherValidation, UsernamePasswordUpdateTeacherValidation} from "../middlewares/validation/teacher.validation.middleware.js";
 
const teacherRouter = express.Router();

teacherRouter.post("/", adminAuthenticate, registerTeacherValidation,  registerTeacherController);
teacherRouter.post("/login", loginTeacherValidation, loginTeacherController);
teacherRouter.get("/all", adminAuthenticate, getAllTeacherOfAdminController);
teacherRouter.get("/unassigned", adminAuthenticate, getAllNonSectionTeacherController);
teacherRouter.get("/:teacherId", adminAuthenticate, getTeacherController);
teacherRouter.put("/auth", teacherAuthenticate, UsernamePasswordUpdateTeacherValidation, updateTeacherController); 
teacherRouter.put("/auth-info-update", teacherAuthenticate, emailPhoneUpdateTeacherValidation, updateTeacherController); 
teacherRouter.put("/", teacherAuthenticate, updateTeacherValidation, updateTeacherController); 
teacherRouter.put("/admin/:teacherId", adminAuthenticate, updateTeacherValidation, updateTeacherController);
teacherRouter.put("/password-change", teacherAuthenticate, changePasswordTeacherController);
teacherRouter.put("/photo-upload", teacherAuthenticate, photoUpdateTeacherValidation, updateTeacherController);
teacherRouter.delete("/:teacherId",  deleteTeacherController);

export default teacherRouter;   