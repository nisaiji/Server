import express from "express";
import { refundPaymentController } from "../../controllers/payments/refund.controller.js";
import { adminAuthenticate } from "../../middlewares/authentication/admin.authentication.middleware.js";

const refundRouter = express.Router();

refundRouter.post("/", adminAuthenticate, refundPaymentController);
// refundRouter.get("/admin", adminAuthenticate,  getRefundRequestsController);
// refundRouter.post("/admin", adminAuthenticate, updateRefundController);
// refundRouter.get("/parent", parentAuthenticate, getRefundRequestsForParentController);

export default refundRouter;
