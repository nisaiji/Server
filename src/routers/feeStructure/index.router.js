import express from "express";
import schoolFeeStructureRouter from "./schoolFeeStructure.router.js";
import sectionFeeStructureRouter from "./sectionFeeStructure.router.js";

const feeStructureRouter = express();

feeStructureRouter.use("/school-fee-structure", schoolFeeStructureRouter);
feeStructureRouter.use("/section-fee-structure", sectionFeeStructureRouter);

export default feeStructureRouter;
