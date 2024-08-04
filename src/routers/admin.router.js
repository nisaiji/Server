import express from "express";
import {getAdminProfileController, loginAdminController,profileUpdateAdminController,registerAdminController, socialProfileUpdateAdminController} from "../controllers/admin.controller.js";
import { adminAuthentication } from "../middlewares/authentication/admin.authentication.middleware.js";
import {adminLoginValidation,adminProfileUpdateValidation,adminRegisterValidation } from "../middlewares/validation/admin.validation.middleware.js"; 

const adminRouter = express.Router();

adminRouter.post("/register", adminRegisterValidation, registerAdminController);
adminRouter.post("/login", adminLoginValidation, loginAdminController);
adminRouter.put("/profile", adminAuthentication,adminProfileUpdateValidation, profileUpdateAdminController);
adminRouter.put("/social-profile", adminAuthentication, socialProfileUpdateAdminController);
adminRouter.get("/profile",adminAuthentication,getAdminProfileController);

export default adminRouter;