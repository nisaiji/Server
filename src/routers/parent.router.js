import express from "express";
import {authUpdateParentController,getChildrenParentController,getHolidayEventParentController,getParentController,loginParentController,passwordChangeController,profileInfoUpdateParentController,profileUpdateParentController} from "../controllers/parent.controller.js";
import { parentAuthentication } from "../middlewares/authentication/parent.authentication.middleware.js";
import {authUpdateParentValidation, loginParentValidation,profileInfoUpdateParentValidation,profileUpdateParentValidation} from "../middlewares/validation/parent.validation.middleware.js";

const parentRouter = express.Router();

parentRouter.post("/login", loginParentValidation, loginParentController);
parentRouter.put("/auth-update",parentAuthentication,authUpdateParentValidation,authUpdateParentController);
parentRouter.put("/profile-update",parentAuthentication,profileUpdateParentValidation,profileUpdateParentController);
parentRouter.put("/profile-info-update",parentAuthentication,profileInfoUpdateParentValidation,profileInfoUpdateParentController);
parentRouter.put("/password-change",parentAuthentication,passwordChangeController)
parentRouter.get("/get-info",parentAuthentication,getParentController);
parentRouter.get("/children",parentAuthentication,getChildrenParentController);
parentRouter.post("/holiday-events",parentAuthentication,getHolidayEventParentController);


export default parentRouter;