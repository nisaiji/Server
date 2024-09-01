import express from "express";
import {authUpdateParentController,getChildrenParentController,getHolidayEventParentController,getParentController,loginParentController,passwordChangeController,profileInfoUpdateParentController,profileUpdateParentController} from "../controllers/parent.controller.js";
import { parentAuthenticate } from "../middlewares/authentication/parent.authentication.middleware.js";
import {authUpdateParentValidation, loginParentValidation,profileInfoUpdateParentValidation,profileUpdateParentValidation} from "../middlewares/validation/parent.validation.middleware.js";

const parentRouter = express.Router();

parentRouter.post("/login", loginParentValidation, loginParentController);
parentRouter.put("/auth-update", parentAuthenticate, authUpdateParentValidation, authUpdateParentController);
parentRouter.put("/profile-update", parentAuthenticate, profileUpdateParentValidation, profileUpdateParentController);
parentRouter.put("/profile-info-update", parentAuthenticate, profileInfoUpdateParentValidation, profileInfoUpdateParentController);
parentRouter.put("/password-change", parentAuthenticate, passwordChangeController)
parentRouter.get("/get-info", parentAuthenticate, getParentController);
parentRouter.get("/children", parentAuthenticate, getChildrenParentController);
parentRouter.post("/holiday-events", parentAuthenticate, getHolidayEventParentController);


export default parentRouter;