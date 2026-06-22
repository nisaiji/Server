import express from "express";

import { createOrUpdateMarchantController } from "../controllers/payments/marchant.controller.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";

const marchantPaymentRouter = express.Router();

marchantPaymentRouter.post("/", adminAuthenticate, createOrUpdateMarchantController);

export default marchantPaymentRouter;
