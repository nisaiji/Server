import express from "express";
import {registerTeacherController, deleteTeacherController,  updateTeacherController, changePasswordTeacherController, loginTeacherController, getAllTeacherOfAdminController, getTeacherController, getAllNonSectionTeacherController, forgetPasswordTeacherController, forgetPasswordUpdateTeacherController, refreshAccessTokenController } from "../controllers/teacher.controller.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";
import { refreshTokenAuthenticate, teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
import {emailPhoneUpdateTeacherValidation, loginTeacherValidation, photoUpdateTeacherValidation, registerTeacherValidation, updateAddressValidation, updateTeacherValidation, UsernamePasswordUpdateTeacherValidation} from "../middlewares/validation/teacher.validation.middleware.js";
import { validateImageSizeMiddleware } from "../middlewares/teacher.middleware.js";
import { authorizeTeacherRoles } from "../middlewares/authorization/teacherRoles.authorization.middleware.js";
 
const teacherRouter = express.Router();

teacherRouter.post("/", adminAuthenticate, registerTeacherValidation,  registerTeacherController);
teacherRouter.post("/login", loginTeacherValidation, loginTeacherController);
teacherRouter.get("/", teacherAuthenticate, authorizeTeacherRoles('teacher'), getTeacherController);
teacherRouter.get("/all", adminAuthenticate, getAllTeacherOfAdminController);
teacherRouter.get("/unassigned", adminAuthenticate, getAllNonSectionTeacherController);
teacherRouter.get("/:teacherId", adminAuthenticate, getTeacherController);
teacherRouter.get("/refresh", refreshTokenAuthenticate, refreshAccessTokenController);
teacherRouter.put("/auth", teacherAuthenticate, authorizeTeacherRoles('teacher'), UsernamePasswordUpdateTeacherValidation, updateTeacherController); 
teacherRouter.put("/auth-info-update", teacherAuthenticate, emailPhoneUpdateTeacherValidation, updateTeacherController); 
teacherRouter.put("/", teacherAuthenticate, authorizeTeacherRoles('teacher'), updateTeacherValidation, updateTeacherController); 
teacherRouter.put("/admin/:teacherId", adminAuthenticate, updateTeacherValidation, updateTeacherController);
teacherRouter.put("/password-change", teacherAuthenticate, authorizeTeacherRoles('teacher'), changePasswordTeacherController);
teacherRouter.put("/forget-password",forgetPasswordTeacherController )
teacherRouter.put("/forget-password-change",forgetPasswordUpdateTeacherController )
teacherRouter.put("/address", teacherAuthenticate, authorizeTeacherRoles('teacher'), updateAddressValidation, updateTeacherController);
teacherRouter.put("/photo-upload", teacherAuthenticate, authorizeTeacherRoles('teacher'), validateImageSizeMiddleware, photoUpdateTeacherValidation, updateTeacherController);
teacherRouter.delete("/:teacherId", adminAuthenticate,  deleteTeacherController);

export default teacherRouter;
