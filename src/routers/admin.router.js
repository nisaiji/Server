import express from "express";
import {loginAdminController,registerAdminController} from "../controllers/admin.controller.js";
import {adminLoginValidation,adminRegisterValidation } from "../middlewares/validation/admin.validation.middleware.js"; 

const adminRouter = express.Router();

adminRouter.post("/register", adminRegisterValidation, registerAdminController);
adminRouter.post("/login", adminLoginValidation, loginAdminController);

export default adminRouter;