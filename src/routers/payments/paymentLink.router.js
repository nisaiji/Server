import express from "express";
import { parentAuthenticate } from "../../middlewares/authentication/v2/parent.authentication.middleware.js";
import { createPaymentLinkController } from "../../controllers/payments/paymentLink.controller.js";

const paymentSessionRouter = express.Router();

paymentSessionRouter.post("/", parentAuthenticate, createPaymentLinkController);

export default paymentSessionRouter;
