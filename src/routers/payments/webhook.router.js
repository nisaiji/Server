import express from "express";
import { paymentWebhookController } from "../../controllers/payments/webhook.controller.js";
import { zohoPaymentWebhookAuthenticate } from "../../middlewares/authentication/webhook.authentication.middleware.js";

const webhookRouter = express.Router();

webhookRouter.post("/", zohoPaymentWebhookAuthenticate, paymentWebhookController);

export default webhookRouter;
