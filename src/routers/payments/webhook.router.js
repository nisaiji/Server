import express from "express";
import { paymentWebhookController, paymentWebhookV2Controller } from "../../controllers/payments/webhook.controller.js";
import { zohoPaymentWebhookAuthenticate } from "../../middlewares/authentication/webhook.authentication.middleware.js";

const webhookRouter = express.Router();

webhookRouter.post("/", zohoPaymentWebhookAuthenticate, paymentWebhookController);
webhookRouter.post("/v2", zohoPaymentWebhookAuthenticate, paymentWebhookV2Controller);

export default webhookRouter;
