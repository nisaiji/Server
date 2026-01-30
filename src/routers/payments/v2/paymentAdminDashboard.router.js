import express from "express";
import { adminAuthenticate } from "../../../middlewares/authentication/admin.authentication.middleware.js";
import { getPaymentAdminDashboardData, getTransactionsController, daywisePaymentsSummaryController, paymentsByPaymentModesController, sectionsReportController, sectionStudentsFeeInstallmentsController, getTotalRefundedAmountController, getParentTransactionsController } from "../../../controllers/payments/v2/paymentAdminDashboard.controller.js";
import { parentAuthenticate } from "../../../middlewares/authentication/parent.authentication.middleware.js";
const paymentAdminDashboardRouter = express.Router();

paymentAdminDashboardRouter.post("/summary", adminAuthenticate, getPaymentAdminDashboardData);
paymentAdminDashboardRouter.post("/transactions", adminAuthenticate, getTransactionsController);
paymentAdminDashboardRouter.post("/parent/transactions", parentAuthenticate, getParentTransactionsController);
paymentAdminDashboardRouter.post("/daywise-summary", adminAuthenticate, daywisePaymentsSummaryController);
paymentAdminDashboardRouter.post("/payment-modes-summary", adminAuthenticate, paymentsByPaymentModesController);
paymentAdminDashboardRouter.post("/sections-report", adminAuthenticate,  sectionsReportController);
paymentAdminDashboardRouter.post("/section-students-report", adminAuthenticate, sectionStudentsFeeInstallmentsController);
paymentAdminDashboardRouter.get("/refunded-amount", adminAuthenticate, getTotalRefundedAmountController);

export default paymentAdminDashboardRouter;
