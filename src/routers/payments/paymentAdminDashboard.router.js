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
import { adminAuthenticate } from "../../middlewares/authentication/admin.authentication.middleware.js";
const paymentAdminDashboardRouter = express.Router();

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

export default paymentAdminDashboardRouter;
