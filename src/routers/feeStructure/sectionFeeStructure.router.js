import express from "express";
import { adminAuthenticate } from "../../middlewares/authentication/admin.authentication.middleware.js";
import { createSectionFeeStructureController, getSectionFeeStructureController, getSessionStudentFeeStructureController, updateSectionFeeStructureController } from "../../controllers/feeStructure/sectionFeeStructure.controller.js";
import { parentAuthenticate } from "../../middlewares/authentication/v2/parent.authentication.middleware.js";

const sectionFeeStructureRouter = express();

sectionFeeStructureRouter.post("/", adminAuthenticate, createSectionFeeStructureController);
sectionFeeStructureRouter.put("/", adminAuthenticate, updateSectionFeeStructureController);
sectionFeeStructureRouter.get("/", adminAuthenticate, getSectionFeeStructureController);
sectionFeeStructureRouter.get("/parent/:sessionStudentId", parentAuthenticate, getSessionStudentFeeStructureController);

export default sectionFeeStructureRouter;
