import express from "express";
import { createRefundController } from "../../controllers/payments/refund.controller.js";

const refundRouter = express.Router();

refundRouter.post("/", createRefundController);

export default refundRouter;
