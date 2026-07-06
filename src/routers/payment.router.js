import express from "express";
import {
  getAdminPaymentHistoryController,
  getAdminReceiptController,
  paymentCallbackController,
  setZohoSecretController,
  zohoWebhookController
} from "../controllers/payment.controller.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";
import { sessionStudentIdParamValidation } from "../middlewares/validation/payment.validation.middleware.js";

const paymentRouter = express.Router();

paymentRouter.post("/webhook/zoho", zohoWebhookController);
paymentRouter.get("/callback", paymentCallbackController);

paymentRouter.put(
  "/admin/zoho/secret",
  adminAuthenticate,
  setZohoSecretController
);

paymentRouter.get(
  "/admin/history/:sessionStudentId",
  adminAuthenticate,
  sessionStudentIdParamValidation,
  getAdminPaymentHistoryController
);

paymentRouter.get(
  "/admin/receipt/:receiptNo",
  adminAuthenticate,
  getAdminReceiptController
);

export default paymentRouter;
