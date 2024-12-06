import express from "express";
import { getChangePasswordRequestsForAdminValidation, registerChangePasswordRequestValidation } from "../middlewares/validation/changePassword.validation.middleware.js";
import { getChangePasswordRequestsController, registerChangePasswordRequestController, updateChangePasswordRequestByAdminController, updatePasswordByVerifiedTeacherController, verifyTeacherForgetPasswordController } from "../controllers/changePassword.controller.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";

const changePasswordRouter = express.Router();

changePasswordRouter.post("/register", registerChangePasswordRequestValidation, registerChangePasswordRequestController )
changePasswordRouter.get("/admin", adminAuthenticate, getChangePasswordRequestsForAdminValidation, getChangePasswordRequestsController)
changePasswordRouter.put("/admin", adminAuthenticate, updateChangePasswordRequestByAdminController)
changePasswordRouter.post("/teacher/verify", verifyTeacherForgetPasswordController)
changePasswordRouter.put("/teacher", updatePasswordByVerifiedTeacherController)

export default changePasswordRouter; 
