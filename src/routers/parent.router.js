import { getHolidayEventController } from "../controllers/holidayEvent.controller.js";
import express from "express";
import { getChildrenParentController, getParentController,loginParentController,passwordChangeController, updateParentController} from "../controllers/parent.controller.js";
import { parentAuthenticate } from "../middlewares/authentication/parent.authentication.middleware.js";
import {AddressUpdateParentValidation, authUpdateParentValidation, loginParentValidation,passwordChangeParentValidation,profileInfoUpdateParentValidation,profileUpdateParentValidation} from "../middlewares/validation/parent.validation.middleware.js";

const parentRouter = express.Router();

parentRouter.post("/login", loginParentValidation, loginParentController);
parentRouter.put("/auth-update", parentAuthenticate, authUpdateParentValidation, updateParentController);
parentRouter.put("/profile-update", parentAuthenticate, profileUpdateParentValidation, updateParentController);
parentRouter.put("/profile-info-update", parentAuthenticate, profileInfoUpdateParentValidation, updateParentController);
parentRouter.put("/address", parentAuthenticate, AddressUpdateParentValidation, updateParentController);
parentRouter.put("/password-change", parentAuthenticate, passwordChangeParentValidation, passwordChangeController)
parentRouter.get("/get-info", parentAuthenticate, getParentController);
parentRouter.get("/children", parentAuthenticate, getChildrenParentController);
parentRouter.post("/holiday-events", parentAuthenticate, getHolidayEventController);


export default parentRouter;