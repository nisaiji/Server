import express from 'express';
import { parentAuthentication } from '../middlewares/authentication/parent.authentication.middleware.js';
import { classTeacherAuthentication } from '../middlewares/authentication/classTeacher.authentication.middleware.js';
import {parentForgetPasswordController,teacherForgetPasswordController} from "../controllers/event.controller.js";
import { adminAuthentication } from '../middlewares/authentication/admin.authentication.middleware.js';
import { parentForgetPasswordValidation } from '../middlewares/validation/event.validation.middleware.js';
import { parentForgetPasswordMiddleware, teacherForgetPasswordMiddleware } from '../middlewares/authorization/event.authorization.middleware.js';


const eventRouter = express.Router();

eventRouter.post("/parent-forget-password",parentAuthentication,parentForgetPasswordValidation,parentForgetPasswordMiddleware, parentForgetPasswordController);
eventRouter.post("/teacher-forget-password",classTeacherAuthentication,teacherForgetPasswordMiddleware, teacherForgetPasswordController);
// eventRouter.get("/admin-forget-password-requests",adminAuthentication, adminAllForgetPasswordRequestsController);


export default eventRouter;