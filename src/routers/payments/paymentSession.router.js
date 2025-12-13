import express from "express";
import { parentAuthenticate } from "../../middlewares/authentication/v2/parent.authentication.middleware.js";
import { createPaymentSessionController } from "../../controllers/payments/paymentSession.controller.js";

const paymentSessionRouter = express.Router();

paymentSessionRouter.post("/", parentAuthenticate, createPaymentSessionController);

export default paymentSessionRouter;
