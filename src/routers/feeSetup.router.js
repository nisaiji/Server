import express from "express";

import {
  addFeeCycleController,
  addFeeHeadController,
  addFeeStructureController,
  deleteFeeHeadController,
  deleteFeeStructureController,
  getFeeCycleController,
  getFeeHeadController,
  getFeeStructureListingController,
  getFeeStructureController,
  getStudentFeeDuesController,
  updateFeeCycleController,
  updateFeeHeadController,
  updateFeeStructureController,
  verifyFeeSetupController
} from "../controllers/feeSetup.controller.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";
import {
  feeCycleCreateValidation,
  feeCycleUpdateValidation,
  feeHeadIdParamValidation,
  feeHeadCreateValidation,
  feeHeadUpdateValidation,
  feeStructureIdParamValidation,
  feeStructureCreateValidation,
  feeStructureUpdateValidation,
  sessionIdParamValidation,
  feeSetupVerifyValidation,
  studentFeeDuesParamValidation
} from "../middlewares/validation/feeSetup.validation.middleware.js";

const feeSetupRouter = express.Router();

feeSetupRouter.use(adminAuthenticate);

feeSetupRouter.post("/fee-cycle", feeCycleCreateValidation, addFeeCycleController);
feeSetupRouter.get("/fee-cycle/:sessionId", sessionIdParamValidation, getFeeCycleController);
feeSetupRouter.put("/fee-cycle/:feeCycleId", feeCycleUpdateValidation, updateFeeCycleController);
feeSetupRouter.post("/fee-head", feeHeadCreateValidation, addFeeHeadController);
feeSetupRouter.get("/fee-head/:sessionId", sessionIdParamValidation, getFeeHeadController);
feeSetupRouter.put("/fee-head/:feeHeadId", feeHeadUpdateValidation, updateFeeHeadController);
feeSetupRouter.delete("/fee-head/:feeHeadId", feeHeadIdParamValidation, deleteFeeHeadController);
feeSetupRouter.post("/fee-structure", feeStructureCreateValidation, addFeeStructureController);
feeSetupRouter.get("/fee-structure/list", getFeeStructureListingController);
feeSetupRouter.get(
  "/fee-structure/:feeStructureId",
  feeStructureIdParamValidation,
  getFeeStructureController
);
feeSetupRouter.put(
  "/fee-structure/:feeStructureId",
  feeStructureUpdateValidation,
  updateFeeStructureController
);
feeSetupRouter.delete(
  "/fee-structure/:feeStructureId",
  feeStructureIdParamValidation,
  deleteFeeStructureController
);
feeSetupRouter.put("/verify", feeSetupVerifyValidation, verifyFeeSetupController);
feeSetupRouter.get(
  "/dues/:sessionId/:studentId",
  studentFeeDuesParamValidation,
  getStudentFeeDuesController
);

export default feeSetupRouter;
