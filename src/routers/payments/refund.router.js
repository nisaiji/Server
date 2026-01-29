import express from "express";
import { applyForRefundController, updateRefundController, getRefundController, getRefundRequestsController, getRefundRequestsForParentController } from "../../controllers/payments/refund.controller.js";
import { parentAuthenticate } from "../../middlewares/authentication/parent.authentication.middleware.js";
import { adminAuthenticate } from "../../middlewares/authentication/admin.authentication.middleware.js";

const refundRouter = express.Router();

refundRouter.post("/apply", parentAuthenticate, applyForRefundController);
refundRouter.get("/admin", adminAuthenticate,  getRefundRequestsController);
refundRouter.post("/admin", adminAuthenticate, updateRefundController);
refundRouter.get("/parent", parentAuthenticate, getRefundRequestsForParentController);

export default refundRouter;
