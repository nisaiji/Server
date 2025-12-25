import express from "express";
import { adminAuthenticate } from "../../middlewares/authentication/admin.authentication.middleware.js";
import { createSectionFeeStructureController } from "../../controllers/feeStructure/sectionFeeStructure.controller.js";

const sectionFeeStructureRouter = express();

sectionFeeStructureRouter.post("/", adminAuthenticate, createSectionFeeStructureController);

export default sectionFeeStructureRouter;
