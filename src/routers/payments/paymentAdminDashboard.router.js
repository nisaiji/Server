import express from "express";
import { 
  classMonthlyCollectionController,
  daywisePaymentsSummaryController, 
  monthwisePaymentsSummaryController,
  parentFeeReminderController,
  paymentsByPaymentModesController, 
  paymentTransactionsController, 
  schoolPaymentsController, 
  // sectionFeeSummaryController, 
  // sectionStudentsWithPaymentController, 
  // sessionStudentTransactionsController
} from "../../controllers/payments/paymentAdminDashboard.controller.js";
const paymentAdminDashboardRouter = express.Router();

paymentAdminDashboardRouter.post("/fee-summary", schoolPaymentsController);
paymentAdminDashboardRouter.post("/daywise-paid", daywisePaymentsSummaryController);
paymentAdminDashboardRouter.post("/monthwise-paid", monthwisePaymentsSummaryController);
paymentAdminDashboardRouter.post("/payment-modes", paymentsByPaymentModesController);
paymentAdminDashboardRouter.post("/transactions", paymentTransactionsController);
paymentAdminDashboardRouter.post("/class-paid", classMonthlyCollectionController);
paymentAdminDashboardRouter.post("/parent-reminder", parentFeeReminderController);
// paymentAdminDashboardRouter.post("/:sessionStudentId/transactions", sessionStudentTransactionsController);
// paymentAdminDashboardRouter.post("/:sessionStudentId/fee", sessionStudentTransactionsController);


// paymentAdminDashboardRouter.post("/:sectionId/fee-summary", sectionFeeSummaryController);
// paymentAdminDashboardRouter.post("/:sectionId/students", sectionStudentsWithPaymentController);

export default paymentAdminDashboardRouter;
