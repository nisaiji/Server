import express from "express";
import { getPaymentTransactionOfSessionStudentForParentController } from "../../controllers/payments/paymentTransaction.controller.js";
import { parentAuthenticate } from "../../middlewares/authentication/v2/parent.authentication.middleware.js";

const paymentTransactionRouter = express.Router();

paymentTransactionRouter.get("/parent/:sessionStudentId", parentAuthenticate, getPaymentTransactionOfSessionStudentForParentController);

export default paymentTransactionRouter;
