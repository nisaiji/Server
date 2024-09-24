import express from "express";



import { getAdminsController, getSuperAdminController, loginSuperAdminController, registerSuperAdminController, updateSuperAdminController } from "../controllers/superAdmin.controller.js";
import { loginSuperAdminValidation, registerSuperAdminValidation, updateSuperAdminValidation } from "../middlewares/validation/superAdminValidation.js";
import { superAdminAuthenticate } from "../middlewares/authentication/superAdmin.authentication.middleware.js";

const superAdminRouter = express.Router();

superAdminRouter.post("/register", registerSuperAdminValidation, registerSuperAdminController);
superAdminRouter.post("/login", loginSuperAdminValidation, loginSuperAdminController);
superAdminRouter.put("/update", superAdminAuthenticate, updateSuperAdminValidation, updateSuperAdminController);
superAdminRouter.get("/profile", superAdminAuthenticate, getSuperAdminController);
superAdminRouter.get("/admins", superAdminAuthenticate, getAdminsController);
export default superAdminRouter;
