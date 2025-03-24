import express from "express";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";
import {
  createHolidaysValidation,
  createHolidayValidation,
  getHolidayValidation,
  updateHolidayValidation
} from "../middlewares/validation/holiday.validation.middleware.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
import { deleteHolidayController, getHolidaysController, registerHolidayController, registerHolidaysController, updateHolidayController } from "../controllers/holiday.controller.js";

const holidayRouter = express.Router();

holidayRouter.post("/register", adminAuthenticate, createHolidayValidation, registerHolidayController );
holidayRouter.post("/v2/register", adminAuthenticate, createHolidaysValidation, registerHolidaysController);
holidayRouter.post("/", adminAuthenticate, getHolidayValidation, getHolidaysController );
holidayRouter.post("/teacher", teacherAuthenticate, getHolidayValidation, getHolidaysController );
holidayRouter.put("/:eventId", adminAuthenticate, updateHolidayValidation, updateHolidayController );
holidayRouter.delete("/:eventId", adminAuthenticate, deleteHolidayController );

export default holidayRouter;
