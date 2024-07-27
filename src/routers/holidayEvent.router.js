import express from 'express';
import { adminAuthentication } from '../middlewares/authentication/admin.authentication.middleware.js';
import { createHolidayEventValidation } from '../middlewares/validation/holidayEvent.validation.middleware.js';
import { createHolidayEventController, deleteHolidayEventController, getHolidayEventController, updateHolidayEventController } from '../controllers/holidayEvent.controller.js';

const holidayEventRouter = express.Router();

holidayEventRouter.post("/register",adminAuthentication,createHolidayEventValidation,createHolidayEventController);
holidayEventRouter.post("/",adminAuthentication,getHolidayEventController);
holidayEventRouter.put("/:eventId",adminAuthentication,updateHolidayEventController);
holidayEventRouter.delete("/:eventId",adminAuthentication,deleteHolidayEventController);

export default holidayEventRouter;