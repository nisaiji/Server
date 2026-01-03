import express from "express";
const paymentAdminDashboardRouter = express.Router();
import * as adminDashboardPaymentController from "../../controllers/payments/paymentAdminDashboard.controller.js";
import { classWiseSummaryValidation, paymentModeReportValidation, installmentReminderValidation } from "../../middlewares/validation/admin-dashboard.validation.middleware.js";

paymentAdminDashboardRouter.post("/fee-summary", adminDashboardPaymentController.schoolPaymentsController);
paymentAdminDashboardRouter.post("/daywise-paid", adminDashboardPaymentController.daywisePaymentsSummaryController);
paymentAdminDashboardRouter.post("/monthwise-paid", adminDashboardPaymentController.monthwisePaymentsSummaryController);
paymentAdminDashboardRouter.post("/payment-modes", adminDashboardPaymentController.paymentsByPaymentModesController);
paymentAdminDashboardRouter.post("/transactions", adminDashboardPaymentController.paymentTransactionsController);

/* Class-Wise Reports */
paymentAdminDashboardRouter.get("/reports/class-wise/summary", classWiseSummaryValidation, adminDashboardPaymentController.classWiseSummaryController);
paymentAdminDashboardRouter.get("/reports/class-wise/chart", classWiseSummaryValidation, adminDashboardPaymentController.classWiseChartController);
paymentAdminDashboardRouter.get("/reports/class-wise/transactions", adminDashboardPaymentController.classWiseTransactionsController);

/* Periodically Reports */
paymentAdminDashboardRouter.get("/reports/periodically/summary", adminDashboardPaymentController.periodicallySummaryController);
paymentAdminDashboardRouter.get("/reports/periodically/chart", adminDashboardPaymentController.periodicallyChartController);
paymentAdminDashboardRouter.get("/reports/periodically/transactions", adminDashboardPaymentController.periodicallyTransactionsController);

/* Payment Mode Reports */
paymentAdminDashboardRouter.get("/reports/payment-mode/summary", paymentModeReportValidation, adminDashboardPaymentController.paymentModeSummaryController);
paymentAdminDashboardRouter.get("/reports/payment-mode/transactions", paymentModeReportValidation, adminDashboardPaymentController.paymentModeTransactionsController);

/* Fee Payment Reports */
paymentAdminDashboardRouter.get("/reports/fee/summary", paymentModeReportValidation, adminDashboardPaymentController.feesSummaryController);
paymentAdminDashboardRouter.get("/reports/fee/transactions", paymentModeReportValidation, adminDashboardPaymentController.feesTransactionsController);
paymentAdminDashboardRouter.get("/reports/fee/reminder", installmentReminderValidation, adminDashboardPaymentController.sendReminderController);

/* Refund and Failed Reports */
paymentAdminDashboardRouter.get("/reports/other/summary", classWiseSummaryValidation, adminDashboardPaymentController.refundFailedSummaryController);
paymentAdminDashboardRouter.get("/reports/other/chart", adminDashboardPaymentController.refundFailedChartController);
paymentAdminDashboardRouter.get("/reports/other/transactions", adminDashboardPaymentController.refundFailedTransactionsController);

// paymentAdminDashboardRouter.post("/:sessionStudentId/transactions", sessionStudentTransactionsController);
// paymentAdminDashboardRouter.post("/:sessionStudentId/fee", sessionStudentTransactionsController);


// paymentAdminDashboardRouter.post("/:sectionId/fee-summary", sectionFeeSummaryController);
// paymentAdminDashboardRouter.post("/:sectionId/students", sectionStudentsWithPaymentController);

export default paymentAdminDashboardRouter;
