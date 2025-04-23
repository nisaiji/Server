import { parentPhoneValidation, parentEmailValidation, parentPhoneAndOtpValidation, parentPasswordValidation, parentFullnameValidation, parentUpdateValidation, parentPasswordEditValidation } from "../../middlewares/validation/v2/parent.validation.middleware.js";
import { addStudentController, editPasswordController, getParentController, getParentStatusController, loginParentController, parentEmailInsertAndSendEmailOtpController, parentEmailVerifyByOtpController, parentPhoneVerifyByOtpController, parentSendOtpToPhoneController, updateParentController } from "../../controllers/v2/parent.controller.js";
import express from "express";
import { parentAuthenticate } from "../../middlewares/authentication/v2/parent.authentication.middleware.js";

const parentRouter = express.Router();
// check phone no todo
parentRouter.get("/", parentAuthenticate, getParentController)
parentRouter.put("/", parentAuthenticate, parentUpdateValidation, updateParentController)
parentRouter.post("/login", loginParentController)
parentRouter.post('/status', getParentStatusController)
parentRouter.post("/phoneVerify", parentPhoneValidation, parentSendOtpToPhoneController )
parentRouter.put("/phoneVerify", parentPhoneAndOtpValidation, parentPhoneVerifyByOtpController )
parentRouter.post("/emailVerify", parentAuthenticate, parentEmailValidation, parentEmailInsertAndSendEmailOtpController)
parentRouter.put("/emailVerify", parentAuthenticate, parentEmailVerifyByOtpController)
parentRouter.put("/password", parentAuthenticate, parentPasswordValidation, updateParentController)
parentRouter.put("/password/edit", parentAuthenticate, parentPasswordEditValidation, editPasswordController)
parentRouter.put("/fullname", parentAuthenticate, parentFullnameValidation, updateParentController)
parentRouter.put('/add', parentAuthenticate, addStudentController)

export default parentRouter;
