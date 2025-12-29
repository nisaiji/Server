import express from "express";
import { adminAuthenticate } from "../../middlewares/authentication/admin.authentication.middleware.js";
import { createSectionFeeStructureController, getSectionFeeStructureController, updateSectionFeeStructureController } from "../../controllers/feeStructure/sectionFeeStructure.controller.js";

const sectionFeeStructureRouter = express();

sectionFeeStructureRouter.post("/", adminAuthenticate, createSectionFeeStructureController);
sectionFeeStructureRouter.put("/", adminAuthenticate, updateSectionFeeStructureController);
sectionFeeStructureRouter.get("/", adminAuthenticate, getSectionFeeStructureController);

export default sectionFeeStructureRouter;
