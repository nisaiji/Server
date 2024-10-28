import { getEventsForAdminValidation, registerEventvalidation } from "../middlewares/validation/event.validation.middleware.js";
import express from "express";
import { getEventsController, registerEventController, updateEventByAdminController } from "../controllers/event.controller.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";

const eventRouter = express.Router();

eventRouter.post("/register", registerEventvalidation, registerEventController )
eventRouter.get("/admin", adminAuthenticate, getEventsForAdminValidation, getEventsController)
eventRouter.put("/admin", adminAuthenticate, updateEventByAdminController)

export default eventRouter; 
