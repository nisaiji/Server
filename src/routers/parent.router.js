import express from "express";
import {adminGetParentController,adminRegisterParentController,authUpdateParentController,getChildrenParentController,getHolidayEventParentController,loginParentController,profileUpdateParentController,registerExistingParentController,registerParentController,updateParentController,} from "../controllers/parent.controller.js";
import { classTeacherAuthentication } from "../middlewares/authentication/classTeacher.authentication.middleware.js";
import { parentAuthentication } from "../middlewares/authentication/parent.authentication.middleware.js";
import {authUpdateParentValidation, loginParentValidation,profileUpdateParentValidation,registerExistingParentValidation,registerParentValidation,updateParentValidation,} from "../middlewares/validation/parent.validation.middleware.js";
import { adminAuthentication } from "../middlewares/authentication/admin.authentication.middleware.js";

const parentRouter = express.Router();

parentRouter.post("/login", loginParentValidation, loginParentController);
parentRouter.put("/auth-update",parentAuthentication,authUpdateParentValidation,authUpdateParentController);
parentRouter.put("/profile-update",parentAuthentication,profileUpdateParentValidation,profileUpdateParentController);
parentRouter.get("/children",parentAuthentication,getChildrenParentController);
parentRouter.get("/holiday-events",parentAuthentication,getHolidayEventParentController);

// parentRouter.post("/register/:studentId",classTeacherAuthentication,registerParentValidation, registerParentController);
// parentRouter.post("/admin-register/:studentId", adminAuthentication, registerParentValidation, adminRegisterParentController);
// parentRouter.post("/link-student-with-existing-parent/:studentId",classTeacherAuthentication,registerExistingParentValidation,registerExistingParentController);
// parentRouter.get("/admin-get-parent/:phone",adminAuthentication,adminGetParentController);
// parentRouter.put("/",parentAuthentication,updateParentValidation,updateParentController);
 

export default parentRouter;