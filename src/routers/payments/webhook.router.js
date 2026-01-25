import express from "express";
import { paymentWebhookController, paymentWebhookV2Controller, paymentWebhookV3Controller, refundWebhookController } from "../../controllers/payments/webhook.controller.js";
import { zohoPaymentWebhookAuthenticate, zohoRefundWebhookAuthenticate } from "../../middlewares/authentication/webhook.authentication.middleware.js";

const webhookRouter = express.Router();

webhookRouter.post("/", zohoPaymentWebhookAuthenticate, paymentWebhookController);
webhookRouter.post("/v2", paymentWebhookV3Controller);
webhookRouter.post("/refund", zohoRefundWebhookAuthenticate, refundWebhookController);

export default webhookRouter;
