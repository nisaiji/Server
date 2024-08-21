import express from 'express';
import { adminAuthenticate } from '../middlewares/authentication/admin.authentication.middleware.js';
import { createHolidayEventValidation } from '../middlewares/validation/holidayEvent.validation.middleware.js';
import { createHolidayEventController, deleteHolidayEventController, getHolidayEventController, updateHolidayEventController } from '../controllers/holidayEvent.controller.js';

const holidayEventRouter = express.Router();

holidayEventRouter.post("/register",adminAuthenticate,createHolidayEventValidation,createHolidayEventController);
holidayEventRouter.post("/",adminAuthenticate,getHolidayEventController);
holidayEventRouter.put("/:eventId",adminAuthenticate,updateHolidayEventController);
holidayEventRouter.delete("/:eventId",adminAuthenticate,deleteHolidayEventController);

export default holidayEventRouter;