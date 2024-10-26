import { getEventsForAdminValidation, registerEventvalidation } from "../middlewares/validation/event.validation.middleware.js";
import express from "express";
import { getEventsController, registerEventController } from "../controllers/event.controller.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";

const eventRouter = express.Router();

eventRouter.post("/register", registerEventvalidation, registerEventController )
eventRouter.get("/admin", adminAuthenticate, getEventsForAdminValidation, getEventsController)

export default eventRouter; 
