import express from "express";
import { 
  classMonthlyCollectionController,
  classWiseChartController,
  classWiseSummaryController,
  classWiseTransactionsController,
  daywisePaymentsSummaryController, 
  feesSummaryController, 
  feesTransactionsController, 
  monthwisePaymentsSummaryController,
  parentFeeReminderController,
  paymentModeSummaryController,
  paymentModeTransactionsController,
  paymentsByPaymentModesController, 
  paymentTransactionsController, 
  periodicallyChartController, 
  periodicallySummaryController, 
  periodicallyTransactionsController, 
  refundFailedChartController, 
  refundFailedSummaryController, 
  refundFailedTransactionsController, 
  schoolPaymentsController,
  sendReminderController, 
  // sectionFeeSummaryController, 
  // sectionStudentsWithPaymentController, 
  // sessionStudentTransactionsController
} from "../../controllers/payments/paymentAdminDashboard.controller.js";
import { adminAuthenticate } from "../../middlewares/authentication/admin.authentication.middleware.js";
import { classWiseSummaryValidation, installmentReminderValidation, paymentModeReportValidation } from "../../middlewares/validation/admin-dashboard.validation.middleware.js";
const paymentAdminDashboardRouter = express.Router();
// import * as adminDashboardPaymentController from "../../controllers/payments/paymentAdminDashboard.controller.js";
// import { recalcDashboard, storeDailySnapshot } from "../../services/balance.service.js";

paymentAdminDashboardRouter.post("/fee-summary", adminAuthenticate, schoolPaymentsController);
paymentAdminDashboardRouter.post("/daywise-paid", adminAuthenticate, daywisePaymentsSummaryController);
paymentAdminDashboardRouter.post("/monthwise-paid", adminAuthenticate, monthwisePaymentsSummaryController);
paymentAdminDashboardRouter.post("/payment-modes", adminAuthenticate, paymentsByPaymentModesController);
paymentAdminDashboardRouter.post("/transactions", adminAuthenticate, paymentTransactionsController);
paymentAdminDashboardRouter.post("/class-paid", adminAuthenticate, classMonthlyCollectionController);
paymentAdminDashboardRouter.post("/parent-reminder", adminAuthenticate, parentFeeReminderController);

// paymentAdminDashboardRouter.post("/:sessionStudentId/transactions", sessionStudentTransactionsController);
// paymentAdminDashboardRouter.post("/:sessionStudentId/fee", sessionStudentTransactionsController);


// paymentAdminDashboardRouter.post("/:sectionId/fee-summary", sectionFeeSummaryController);
// paymentAdminDashboardRouter.post("/:sectionId/students", sectionStudentsWithPaymentController);
/* Class-Wise Reports */
paymentAdminDashboardRouter.get("/reports/class-wise/summary", classWiseSummaryValidation, classWiseSummaryController);
paymentAdminDashboardRouter.get("/reports/class-wise/chart", classWiseSummaryValidation, classWiseChartController);
paymentAdminDashboardRouter.get("/reports/class-wise/transactions", classWiseTransactionsController);

/* Periodically Reports */
paymentAdminDashboardRouter.get("/reports/periodically/summary", periodicallySummaryController);
paymentAdminDashboardRouter.get("/reports/periodically/chart", periodicallyChartController);
paymentAdminDashboardRouter.get("/reports/periodically/transactions", periodicallyTransactionsController);

/* Payment Mode Reports */
paymentAdminDashboardRouter.get("/reports/payment-mode/summary", paymentModeReportValidation, paymentModeSummaryController);
paymentAdminDashboardRouter.get("/reports/payment-mode/transactions", paymentModeReportValidation, paymentModeTransactionsController);

/* Fee Payment Reports */
paymentAdminDashboardRouter.get("/reports/fee/summary", paymentModeReportValidation, feesSummaryController);
paymentAdminDashboardRouter.get("/reports/fee/transactions", paymentModeReportValidation, feesTransactionsController);
paymentAdminDashboardRouter.post("/reports/fee/reminder", installmentReminderValidation, sendReminderController);

/* Refund and Failed Reports */
paymentAdminDashboardRouter.get("/reports/other/summary", classWiseSummaryValidation, refundFailedSummaryController);
paymentAdminDashboardRouter.get("/reports/other/chart", refundFailedChartController);
paymentAdminDashboardRouter.get("/reports/other/transactions", refundFailedTransactionsController);


// paymentAdminDashboardRouter.post("/:sectionId/fee-summary", sectionFeeSummaryController);
// paymentAdminDashboardRouter.post("/:sectionId/students", sectionStudentsWithPaymentController);

export default paymentAdminDashboardRouter;
