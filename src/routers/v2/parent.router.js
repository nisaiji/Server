import { parentPhoneValidation, parentEmailValidation, parentPhoneAndOtpValidation } from "../../middlewares/validation/v2/parent.validation.middleware.js";
import { loginParentController, parentEmailInsertAndSendEmailOtpController, parentEmailVerifyByOtpController, parentPhoneVerifyByOtpController, parentSendOtpToPhoneController } from "../../controllers/v2/parent.controller.js";
import express from "express";
import { parentAuthenticate } from "../../middlewares/authentication/v2/parent.authentication.middleware.js";

const parentRouter = express.Router();

parentRouter.post("/login", loginParentController)
parentRouter.post("/phoneVerify", parentPhoneValidation, parentSendOtpToPhoneController )
parentRouter.put("/phoneVerify", parentPhoneAndOtpValidation, parentPhoneVerifyByOtpController )
parentRouter.post("/emailVerify", parentAuthenticate, parentEmailValidation, parentEmailInsertAndSendEmailOtpController)
parentRouter.put("/emailVerify", parentAuthenticate, parentEmailVerifyByOtpController)

export default parentRouter;