import express from "express";
import {authUpdateParentController,getChildrenParentController,getHolidayEventParentController,getParentController,loginParentController,passwordChangeController,profileInfoUpdateParentController,profileUpdateParentController} from "../controllers/parent.controller.js";
import { parentAuthentication } from "../middlewares/authentication/parent.authentication.middleware.js";
import {authUpdateParentValidation, loginParentValidation,profileInfoUpdateParentValidation,profileUpdateParentValidation} from "../middlewares/validation/parent.validation.middleware.js";

const parentRouter = express.Router();

parentRouter.post("/login", loginParentValidation, loginParentController);
parentRouter.put("/auth-update",parentAuthentication,authUpdateParentValidation,authUpdateParentController);
parentRouter.put("/profile-update",parentAuthentication,profileUpdateParentValidation,profileUpdateParentController);
parentRouter.put("/profile-info-update",parentAuthentication,profileInfoUpdateParentValidation,profileInfoUpdateParentController);
parentRouter.get("/get-info",parentAuthentication,getParentController);
parentRouter.get("/children",parentAuthentication,getChildrenParentController);
parentRouter.get("/holiday-events",parentAuthentication,getHolidayEventParentController);
parentRouter.put("/password-change",parentAuthentication,passwordChangeController)

// parentRouter.
// parentRouter.post("/register/:studentId",classTeacherAuthentication,registerParentValidation, registerParentController);
// parentRouter.post("/admin-register/:studentId", adminAuthentication, registerParentValidation, adminRegisterParentController);
// parentRouter.post("/link-student-with-existing-parent/:studentId",classTeacherAuthentication,registerExistingParentValidation,registerExistingParentController);
// parentRouter.get("/admin-get-parent/:phone",adminAuthentication,adminGetParentController);
// parentRouter.put("/",parentAuthentication,updateParentValidation,updateParentController);
 

export default parentRouter;