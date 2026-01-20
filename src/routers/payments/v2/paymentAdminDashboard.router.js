import express from "express";
import { adminAuthenticate } from "../../../middlewares/authentication/admin.authentication.middleware.js";
import { getPaymentAdminDashboardData, getTransactionsController, daywisePaymentsSummaryController } from "../../../controllers/payments/v2/paymentAdminDashboard.controller.js";
const paymentAdminDashboardRouter = express.Router();

paymentAdminDashboardRouter.post("/summary", adminAuthenticate, getPaymentAdminDashboardData);
paymentAdminDashboardRouter.post("/transactions", adminAuthenticate, getTransactionsController);
paymentAdminDashboardRouter.post("/daywise-summary", adminAuthenticate, daywisePaymentsSummaryController);

export default paymentAdminDashboardRouter;
