import { parentPhoneValidation, parentEmailValidation, parentPhoneAndOtpValidation, parentPasswordValidation, parentFullnameValidation, parentUpdateValidation, parentPasswordEditValidation, parentPhotoUploadValidation, parentFcmTokenValidation, parentEmailTokenValidation, parentPhoneTokenValidation } from "../../middlewares/validation/v2/parent.validation.middleware.js";
import { addStudentController, checkValidStudentController, editPasswordController, getHolidayAndWorkdayController, getParentController, getParentStatusController, getParentWithStudentsController, loginParentController, parentEmailInsertAndSendEmailOtpController, parentEmailVerifyByOtpController, parentPhoneUpdateSendOtpToPhoneController, parentPhoneUpdateVerifyByOtpController, parentPhoneVerifyByOtpController, parentSendOtpToPhoneController, parentUpdateEmailAndSendEmailOtpController, parentUpdateEmailVerifyByOtpController, updateParentController, verifyEmailController, verifyPhoneController } from "../../controllers/v2/parent.controller.js";
import express from "express";
import { parentAuthenticate } from "../../middlewares/authentication/v2/parent.authentication.middleware.js";
import { validateImageSizeMiddleware } from "../../middlewares/teacher.middleware.js";

const parentRouter = express.Router();

parentRouter.get("/", parentAuthenticate, getParentWithStudentsController)
parentRouter.put("/", parentAuthenticate, parentUpdateValidation, updateParentController);
parentRouter.post("/login", loginParentController);
parentRouter.post('/status', getParentStatusController);
parentRouter.post("/phoneVerify", parentPhoneValidation, parentSendOtpToPhoneController );
parentRouter.put("/phoneVerify", parentPhoneAndOtpValidation, parentPhoneVerifyByOtpController );
parentRouter.post("/emailVerify", parentAuthenticate, parentEmailValidation, parentEmailInsertAndSendEmailOtpController);
parentRouter.put("/emailVerify", parentAuthenticate, parentEmailVerifyByOtpController);
parentRouter.put("/password", parentAuthenticate, parentPasswordValidation, updateParentController);
parentRouter.put("/password/edit", parentAuthenticate, parentPasswordEditValidation, editPasswordController);
parentRouter.put("/fullname", parentAuthenticate, parentFullnameValidation, updateParentController);
parentRouter.put('/check-valid-student', parentAuthenticate, checkValidStudentController);
parentRouter.put('/add', parentAuthenticate, addStudentController);
parentRouter.put("/photo-upload", parentAuthenticate, parentPhotoUploadValidation, validateImageSizeMiddleware, updateParentController);
parentRouter.put("/fcm-token", parentAuthenticate, parentFcmTokenValidation, updateParentController);
parentRouter.post("/update/phone-verify", parentAuthenticate, parentPhoneUpdateSendOtpToPhoneController );
parentRouter.put("/update/phone-verify", parentAuthenticate, parentPhoneUpdateVerifyByOtpController);
parentRouter.post("/update/email-verify", parentAuthenticate, parentUpdateEmailAndSendEmailOtpController);
parentRouter.put("/update/email-verify", parentAuthenticate, parentUpdateEmailVerifyByOtpController);
parentRouter.post('/holiday-workday', parentAuthenticate, getHolidayAndWorkdayController);
parentRouter.post("/phone/verify", parentPhoneTokenValidation, verifyPhoneController );
parentRouter.post("/email/verify", parentAuthenticate, parentEmailTokenValidation, verifyEmailController );

export default parentRouter;
