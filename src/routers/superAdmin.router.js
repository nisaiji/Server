import express from "express";



import { getSuperAdminController, loginSuperAdminController, registerSuperAdminController, updateSuperAdminController } 
from "../controllers/superAdmin.controller.js";
import { loginSuperAdminValidation, registerSuperAdminValidation, updateSuperAdminValidation } from "../middlewares/validation/superAdminValidation.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";

const superAdminRouter = express.Router();

// Register Super Admin (Only one can be created)
superAdminRouter.post("/register", registerSuperAdminValidation, registerSuperAdminController);

// Login Super Admin
superAdminRouter.post("/login", loginSuperAdminValidation, loginSuperAdminController);


// Update Super Admin Profile (JWT protected)
superAdminRouter.put("/update", adminAuthenticate, updateSuperAdminValidation, updateSuperAdminController);

// Get Super Admin Profile (JWT protected)
superAdminRouter.get("/profile", adminAuthenticate, getSuperAdminController);

export default superAdminRouter;
