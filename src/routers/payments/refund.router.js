import express from "express";
import { createRefundController, getRefundController } from "../../controllers/payments/refund.controller.js";

const refundRouter = express.Router();

refundRouter.post("/", createRefundController);
refundRouter.get("/", getRefundController);

export default refundRouter;
