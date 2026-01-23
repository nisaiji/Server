import express from "express";
import { adminAuthenticate } from "../../middlewares/authentication/admin.authentication.middleware.js";
import { createSchoolFeeStructureController, getSchoolFeeStructureController } from "../../controllers/feeStructure/schoolFeeStructure.controller.js";
import { getSessionFeeStructureController } from "../../controllers/feeStructure/sectionFeeStructure.controller.js";

const schoolFeeStructureRouter = express();

schoolFeeStructureRouter.post("/", adminAuthenticate, createSchoolFeeStructureController);
schoolFeeStructureRouter.post("/get-school-fee-structure", adminAuthenticate, getSchoolFeeStructureController);
schoolFeeStructureRouter.get("/session/:sessionId", adminAuthenticate, getSessionFeeStructureController);

export default schoolFeeStructureRouter;
