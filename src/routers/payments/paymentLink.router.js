import express from "express";
import { parentAuthenticate } from "../../middlewares/authentication/v2/parent.authentication.middleware.js";
import { createPaymentLinkController, verifyPaymentController } from "../../controllers/payments/paymentLink.controller.js";

const paymentLinkRouter = express.Router();

paymentLinkRouter.post("/", parentAuthenticate, createPaymentLinkController);
paymentLinkRouter.post("/verify", verifyPaymentController);

export default paymentLinkRouter;
