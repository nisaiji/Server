import express from "express";
import { adminAuthenticate } from "../../../middlewares/authentication/admin.authentication.middleware.js";
import { getPaymentAdminDashboardData, getTransactionsController, daywisePaymentsSummaryController, paymentsByPaymentModesController } from "../../../controllers/payments/v2/paymentAdminDashboard.controller.js";
const paymentAdminDashboardRouter = express.Router();

paymentAdminDashboardRouter.post("/summary", adminAuthenticate, getPaymentAdminDashboardData);
paymentAdminDashboardRouter.post("/transactions", adminAuthenticate, getTransactionsController);
paymentAdminDashboardRouter.post("/daywise-summary", adminAuthenticate, daywisePaymentsSummaryController);
paymentAdminDashboardRouter.post("/payment-modes-summary", adminAuthenticate, paymentsByPaymentModesController);

export default paymentAdminDashboardRouter;
