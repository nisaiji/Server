import express from "express";
import { monthlyPaymentsSummaryController, paymentsByPaymentModesController, paymentTransactionsController, schoolPaymentsController, sectionFeeSummaryController, sectionStudentsWithPaymentController } from "../../controllers/payments/paymentAdminDashboard.controller.js";
const paymentAdminDashboardRouter = express.Router();

paymentAdminDashboardRouter.post("/fee-summary", schoolPaymentsController);
paymentAdminDashboardRouter.post("/fee-paid", monthlyPaymentsSummaryController);
paymentAdminDashboardRouter.post("/payment-by-modes", paymentsByPaymentModesController);
paymentAdminDashboardRouter.post("/payment-transactions", paymentTransactionsController);
paymentAdminDashboardRouter.post("/:sectionId/fee-summary", sectionFeeSummaryController);
paymentAdminDashboardRouter.post("/:sectionId/students", sectionStudentsWithPaymentController);

export default paymentAdminDashboardRouter;
