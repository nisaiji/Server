import express from "express";
import { sendNotificationByAdminController } from "../controllers/notification.controller.js";

const notificationRouter = express.Router();

notificationRouter.post('/', sendNotificationByAdminController);

export default notificationRouter;
