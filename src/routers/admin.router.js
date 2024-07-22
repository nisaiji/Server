import express from "express";
import {getAdminProfileController, loginAdminController,registerAdminController} from "../controllers/admin.controller.js";
import { adminAuthentication } from "../middlewares/authentication/admin.authentication.middleware.js";
import {adminLoginValidation,adminRegisterValidation } from "../middlewares/validation/admin.validation.middleware.js"; 

const adminRouter = express.Router();

adminRouter.post("/register", adminRegisterValidation, registerAdminController);
adminRouter.post("/login", adminLoginValidation, loginAdminController);
adminRouter.get("/profile",adminAuthentication,getAdminProfileController);

export default adminRouter;