import express from "express";
import { createSessionController, getAllSessionsOfSchoolController, getSessionByIdController } from "../controllers/session.controller.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";

const sessionRouter = express.Router();

sessionRouter.post("/", adminAuthenticate, createSessionController);
sessionRouter.get("/", adminAuthenticate, getAllSessionsOfSchoolController);
sessionRouter.get("/:sessionId", adminAuthenticate, getSessionByIdController);

export default sessionRouter;