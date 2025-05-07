import express from "express";
import { unVerifiedAdminAuthenticate } from "../../middlewares/authentication/v2/unVerifiedAdmin.authenticate.middleware.js";
import { adminEmailVerifyByOtpController, adminGetStatusController, adminLoginController, adminPhoneVerifyByOtpController, adminReSendOtpToPhoneController, adminSendOtpToEmailController, adminSendOtpToPhoneController, updateAdminController } from "../../controllers/v2/adminController.js";
import { adminDetailsValidation, adminEmailOtpValidation, adminEmailValidation, adminPasswordUpdateValidation, adminPhoneAndOtpValidation, adminPhoneValidation } from "../../middlewares/validation/v2/admin.validation.middleware.js";
import { adminAuthenticate } from "../../middlewares/authentication/admin.authentication.middleware.js";

const adminRouter = express.Router();

adminRouter.post('/status', adminPhoneValidation, adminGetStatusController);
adminRouter.post('/login', adminLoginController);
adminRouter.post('/phoneVerify', adminPhoneValidation, adminSendOtpToPhoneController);
adminRouter.post('/phoneVerify/resend-otp', adminPhoneValidation, adminReSendOtpToPhoneController);
adminRouter.put('/phoneVerify', adminPhoneAndOtpValidation, adminPhoneVerifyByOtpController);
adminRouter.put('/password', unVerifiedAdminAuthenticate, adminPasswordUpdateValidation, updateAdminController);
adminRouter.post("/emailVerify", unVerifiedAdminAuthenticate, adminEmailValidation, adminSendOtpToEmailController);
adminRouter.put("/emailVerify", unVerifiedAdminAuthenticate, adminEmailOtpValidation, adminEmailVerifyByOtpController);
adminRouter.put("/details", adminAuthenticate, adminDetailsValidation, updateAdminController);

export default adminRouter;
