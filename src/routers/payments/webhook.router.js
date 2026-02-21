import express from "express";
import { paymentWebhookController, refundWebhookController } from "../../controllers/payments/webhook.controller.js";
import { zohoPaymentWebhookAuthenticate, zohoRefundWebhookAuthenticate } from "../../middlewares/authentication/webhook.authentication.middleware.js";

const webhookRouter = express.Router();

webhookRouter.post("/v2", zohoPaymentWebhookAuthenticate, paymentWebhookController);
webhookRouter.post("/refund", zohoRefundWebhookAuthenticate, refundWebhookController);

export default webhookRouter;
