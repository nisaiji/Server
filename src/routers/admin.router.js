import express from "express";
import {getAdminController, loginAdminController, registerAdminController, updateAdminController} from "../controllers/admin.controller.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";
import {adminLoginValidation, adminProfileUpdateValidation,adminRegisterValidation, adminSocialProfileUpdateValidation } from "../middlewares/validation/admin.validation.middleware.js"; 

const adminRouter = express.Router();

adminRouter.post("/", adminRegisterValidation, registerAdminController);
adminRouter.post("/login", adminLoginValidation, loginAdminController);
adminRouter.put("/", adminAuthenticate, adminProfileUpdateValidation, updateAdminController);
adminRouter.put("/social", adminAuthenticate, adminSocialProfileUpdateValidation, updateAdminController);
adminRouter.get("/",adminAuthenticate, getAdminController);

export default adminRouter; 