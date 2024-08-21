import express from "express";
import { teacherForgetPasswordEvent } from "../controllers/event.controller.js";

const eventRouter = express.Router();

eventRouter.post("/forget-password", teacherForgetPasswordEvent);

// eventRouter.post("/parent-forget-password",parentAuthenticate,parentForgetPasswordValidation,parentForgetPasswordMiddleware, parentForgetPasswordController);
// eventRouter.post("/teacher-forget-password",teacherForgetPasswordMiddleware, teacherForgetPasswordController);
// eventRouter.get("/admin-forget-password-requests",adminAuthenticate, adminAllForgetPasswordRequestsController);

export default eventRouter;
