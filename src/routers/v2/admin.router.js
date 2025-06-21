import express from "express";
import { unVerifiedAdminAuthenticate } from "../../middlewares/authentication/v2/unVerifiedAdmin.authenticate.middleware.js";
import { adminEmailVerifyByOtpController, adminEmailVerifyController, adminGetStatusController, adminLoginController, adminPhoneVerifyByOtpController, adminPhoneVerifyController, adminReSendOtpToPhoneController, adminSendOtpToEmailController, adminSendOtpToPhoneController, updateAdminController } from "../../controllers/v2/adminController.js";
import { adminDetailsValidation, adminEmailOtpValidation, adminEmailValidation, adminPasswordUpdateValidation, adminPhoneAndOtpValidation, adminPhoneValidation } from "../../middlewares/validation/v2/admin.validation.middleware.js";
import { adminAuthenticate, deactivatedAdminAuthenticate } from "../../middlewares/authentication/admin.authentication.middleware.js";

const adminRouter = express.Router();

adminRouter.post('/status', adminPhoneValidation, adminGetStatusController);
adminRouter.post('/login', adminLoginController);

adminRouter.post('/phoneVerify', adminPhoneValidation, adminSendOtpToPhoneController);
adminRouter.post('/phoneVerify/resend-otp', adminPhoneValidation, adminReSendOtpToPhoneController);
adminRouter.put('/phoneVerify', adminPhoneAndOtpValidation, adminPhoneVerifyByOtpController);

adminRouter.post("/emailVerify", unVerifiedAdminAuthenticate, adminEmailValidation, adminSendOtpToEmailController);
adminRouter.put("/emailVerify", unVerifiedAdminAuthenticate, adminEmailOtpValidation, adminEmailVerifyByOtpController);

adminRouter.post("/phone/verify", adminPhoneVerifyController);
adminRouter.post("/email/verify", unVerifiedAdminAuthenticate, adminEmailVerifyController);

adminRouter.put('/password', deactivatedAdminAuthenticate, adminPasswordUpdateValidation, updateAdminController);
adminRouter.put("/details", deactivatedAdminAuthenticate, adminDetailsValidation, updateAdminController);

export default adminRouter;
