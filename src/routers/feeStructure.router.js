import express from 'express';
import { createFeeStructureController } from '../controllers/feeStructure.controller.js';
import { adminAuthenticate } from '../middlewares/authentication/admin.authentication.middleware.js';

const feeStructureRouter = express.Router();

feeStructureRouter.post("/", adminAuthenticate, createFeeStructureController);

export default feeStructureRouter;
