import express from 'express';
import { createFeeStructureController, getFeeStructureController, getFeeStructureControllerForAdmin } from '../controllers/feeStructure.controller.js';
import { adminAuthenticate } from '../middlewares/authentication/admin.authentication.middleware.js';

const feeStructureRouter = express.Router();

feeStructureRouter.post("/", adminAuthenticate, createFeeStructureController);
feeStructureRouter.get("/admin", adminAuthenticate, getFeeStructureControllerForAdmin);
feeStructureRouter.get("/:sessionStudentId", getFeeStructureController);

export default feeStructureRouter;
