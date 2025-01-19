import express from "express";
import {getAdminController, getStudentDemoExcelSheetController, loginAdminController, refreshAccessTokenController, registerAdminController, updateAdminController} from "../controllers/admin.controller.js";
import { adminAuthenticate, deactivatedAdminAuthenticate, refreshTokenAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";
import {adminAddressValidation, adminDetailsValidation, adminLoginValidation, adminProfileUpdateValidation,adminRegisterValidation, adminSocialProfileUpdateValidation } from "../middlewares/validation/admin.validation.middleware.js"; 
const adminRouter = express.Router();

adminRouter.post("/", adminRegisterValidation, registerAdminController);
adminRouter.post("/login", adminLoginValidation, loginAdminController);
adminRouter.get("/refresh", refreshTokenAuthenticate, refreshAccessTokenController);
adminRouter.put("/address", deactivatedAdminAuthenticate, adminAddressValidation, updateAdminController);
adminRouter.put("/details", deactivatedAdminAuthenticate, adminDetailsValidation, updateAdminController);
adminRouter.put("/", adminAuthenticate, adminProfileUpdateValidation, updateAdminController);
adminRouter.put("/social", adminAuthenticate, adminSocialProfileUpdateValidation, updateAdminController);
adminRouter.get("/", deactivatedAdminAuthenticate, getAdminController);
adminRouter.get("/students-excelsheet", adminAuthenticate, getStudentDemoExcelSheetController)

export default adminRouter;
