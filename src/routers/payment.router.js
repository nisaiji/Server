import express from "express";
import {
  getAdminPaymentHistoryController,
  getAllAdminPaymentHistoryController,
  getAdminReceiptController,
  paymentCallbackController,
  setZohoSecretController,
  zohoWebhookController
} from "../controllers/payment.controller.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";
import { sessionStudentIdParamValidation } from "../middlewares/validation/payment.validation.middleware.js";

const paymentRouter = express.Router();

paymentRouter.post(
  "/zoho/webhook",
  express.json({
    verify: (req, res, buf) => {
      // Stash the raw bytes as a string before they're parsed into req.body
      req["rawBody"] = buf.toString("utf8");
    }
  }),
  zohoWebhookController
);
paymentRouter.get("/callback", paymentCallbackController);

paymentRouter.post(
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
  "/admin/history",
  adminAuthenticate,
  getAllAdminPaymentHistoryController
);

paymentRouter.get(
  "/admin/receipt/:receiptNo",
  adminAuthenticate,
  getAdminReceiptController
);

export default paymentRouter;
