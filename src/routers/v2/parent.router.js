import express from "express";
import { getStudentFeeDuesController } from "../../controllers/feeSetup.controller.js";
import {
  cancelPaymentController,
  getPaymentController,
  getPaymentHistoryController,
  getReceiptController,
  initiatePaymentController
} from "../../controllers/payment.controller.js";
import {
  addStudentController,
  checkValidStudentController,
  editPasswordController,
  getHolidayAndWorkdayController,
  getParentPasswordChangeRequestsController,
  getParentStatusController,
  getParentWithStudentsController,
  loginParentController,
  parentEmailInsertAndSendEmailOtpController,
  parentEmailVerifyByOtpController,
  parentPhoneUpdateSendOtpToPhoneController,
  parentPhoneUpdateVerifyByOtpController,
  parentPhoneVerifyByOtpController,
  parentSendOtpToPhoneController,
  parentUpdateEmailAndSendEmailOtpController,
  parentUpdateEmailVerifyByOtpController,
  refreshParentAccessTokenController,
  requestParentPasswordChangeController,
  updateParentController,
  verifyAndChangePasswordController,
  verifyEmailController,
  verifyPhoneController
} from "../../controllers/v2/parent.controller.js";
import {
  parentAuthenticate,
  refreshParentTokenAuthenticate
} from "../../middlewares/authentication/v2/parent.authentication.middleware.js";
import { validateImageSizeMiddleware } from "../../middlewares/teacher.middleware.js";
import { studentFeeDuesParamValidation } from "../../middlewares/validation/feeSetup.validation.middleware.js";
import {
  initiatePaymentValidation,
  paymentIdParamValidation,
  sessionStudentIdParamValidation
} from "../../middlewares/validation/payment.validation.middleware.js";
import {
  parentEmailTokenValidation,
  parentEmailValidation,
  parentFcmTokenValidation,
  parentFullnameValidation,
  parentPasswordEditValidation,
  parentPasswordValidation,
  parentPhoneAndOtpValidation,
  parentPhoneTokenValidation,
  parentPhoneValidation,
  parentPhotoUploadValidation,
  parentUpdateValidation
} from "../../middlewares/validation/v2/parent.validation.middleware.js";

const parentRouter = express.Router();

parentRouter.get("/", parentAuthenticate, getParentWithStudentsController);
parentRouter.put(
  "/",
  parentAuthenticate,
  parentUpdateValidation,
  updateParentController
);
parentRouter.post("/login", loginParentController);
parentRouter.post("/status", getParentStatusController);
parentRouter.post(
  "/phoneVerify",
  parentPhoneValidation,
  parentSendOtpToPhoneController
);
parentRouter.put(
  "/phoneVerify",
  parentPhoneAndOtpValidation,
  parentPhoneVerifyByOtpController
);
parentRouter.post(
  "/emailVerify",
  parentAuthenticate,
  parentEmailValidation,
  parentEmailInsertAndSendEmailOtpController
);
parentRouter.put(
  "/emailVerify",
  parentAuthenticate,
  parentEmailVerifyByOtpController
);
parentRouter.put(
  "/password",
  parentAuthenticate,
  parentPasswordValidation,
  updateParentController
);
parentRouter.put(
  "/password/edit",
  parentAuthenticate,
  parentPasswordEditValidation,
  editPasswordController
);
parentRouter.put(
  "/fullname",
  parentAuthenticate,
  parentFullnameValidation,
  updateParentController
);
parentRouter.put(
  "/check-valid-student",
  parentAuthenticate,
  checkValidStudentController
);
parentRouter.put("/add", parentAuthenticate, addStudentController);
parentRouter.put(
  "/photo-upload",
  parentAuthenticate,
  parentPhotoUploadValidation,
  validateImageSizeMiddleware,
  updateParentController
);
parentRouter.put(
  "/fcm-token",
  parentAuthenticate,
  parentFcmTokenValidation,
  updateParentController
);
parentRouter.post(
  "/update/phone-verify",
  parentAuthenticate,
  parentPhoneUpdateSendOtpToPhoneController
);
parentRouter.put(
  "/update/phone-verify",
  parentAuthenticate,
  parentPhoneUpdateVerifyByOtpController
);
parentRouter.post(
  "/update/email-verify",
  parentAuthenticate,
  parentUpdateEmailAndSendEmailOtpController
);
parentRouter.put(
  "/update/email-verify",
  parentAuthenticate,
  parentUpdateEmailVerifyByOtpController
);
parentRouter.post(
  "/holiday-workday",
  parentAuthenticate,
  getHolidayAndWorkdayController
);
parentRouter.post(
  "/phone/verify",
  parentPhoneTokenValidation,
  verifyPhoneController
);
parentRouter.post(
  "/email/verify",
  parentAuthenticate,
  parentEmailTokenValidation,
  verifyEmailController
);
parentRouter.get(
  "/refresh",
  refreshParentTokenAuthenticate,
  refreshParentAccessTokenController
);
parentRouter.post(
  "/request-password-change",
  requestParentPasswordChangeController
);
parentRouter.put(
  "/verify-and-change-password",
  verifyAndChangePasswordController
);
parentRouter.get(
  "/password-change-requests",
  parentAuthenticate,
  getParentPasswordChangeRequestsController
);
parentRouter.get(
  "/dues/:sessionId/:studentId",
  parentAuthenticate,
  studentFeeDuesParamValidation,
  getStudentFeeDuesController
);
parentRouter.post(
  "/payment/initiate",
  parentAuthenticate,
  initiatePaymentValidation,
  initiatePaymentController
);
parentRouter.post(
  "/payment/:paymentId/cancel",
  parentAuthenticate,
  paymentIdParamValidation,
  cancelPaymentController
);
parentRouter.get(
  "/payment/history/:sessionStudentId",
  parentAuthenticate,
  sessionStudentIdParamValidation,
  getPaymentHistoryController
);
parentRouter.get(
  "/payment/:paymentId",
  parentAuthenticate,
  paymentIdParamValidation,
  getPaymentController
);
parentRouter.get(
  "/receipt/:paymentId",
  parentAuthenticate,
  paymentIdParamValidation,
  getReceiptController
);
export default parentRouter;
