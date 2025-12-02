import express from "express";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";
import { createOrUpdateMarchantController } from "../controllers/payments/marchant.controller.js";

const marchantPaymentRouter = express.Router();

marchantPaymentRouter.post("/", adminAuthenticate, createOrUpdateMarchantController);

export default marchantPaymentRouter;
