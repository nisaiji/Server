import express from "express";
import { changePasswordByVerifiedTeacherValidation, getChangePasswordRequestsForAdminValidation, registerChangePasswordRequestValidation, verfiyTeacherChangePasswordValidation } from "../middlewares/validation/changePassword.validation.middleware.js";
import { changePasswordByVerifiedTeacherController, getChangePasswordRequestsController, registerChangePasswordRequestController, updateChangePasswordRequestByAdminController, verifyTeacherForgetPasswordController } from "../controllers/changePassword.controller.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";

const changePasswordRouter = express.Router();

changePasswordRouter.post("/register", registerChangePasswordRequestValidation, registerChangePasswordRequestController )
changePasswordRouter.get("/admin", adminAuthenticate, getChangePasswordRequestsForAdminValidation, getChangePasswordRequestsController)
changePasswordRouter.put("/admin", adminAuthenticate, updateChangePasswordRequestByAdminController)
changePasswordRouter.post("/teacher/verify", verfiyTeacherChangePasswordValidation, verifyTeacherForgetPasswordController)
changePasswordRouter.put("/teacher", changePasswordByVerifiedTeacherValidation, changePasswordByVerifiedTeacherController)

export default changePasswordRouter; 
