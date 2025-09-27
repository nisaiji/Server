import express from "express";
import { createExamController, getExamsForAdminController } from "../controllers/exam.controller.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";
const examRouter = express.Router();

examRouter.post("/", adminAuthenticate, createExamController);
examRouter.get('/:sectionId', adminAuthenticate, getExamsForAdminController);

export default examRouter;
