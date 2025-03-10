import express from "express";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";
import { deleteWorkDayController, getWorkDaysController, registerWorkDayController, updateWorkDayController } from "../controllers/workDay.controller.js";
import { createWorkDayValidation, getWorkDayValidation, updateWorkDayValidation } from "../middlewares/validation/workDay.validation.middleware.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";

const workDayRouter = express.Router();

workDayRouter.post("/register", adminAuthenticate, createWorkDayValidation, registerWorkDayController );
workDayRouter.post("/", adminAuthenticate, getWorkDayValidation, getWorkDaysController );
workDayRouter.post("/teacher", teacherAuthenticate, getWorkDayValidation, getWorkDaysController );
workDayRouter.put("/:workDayId", adminAuthenticate, updateWorkDayValidation, updateWorkDayController );
workDayRouter.delete("/:workDayId", adminAuthenticate, deleteWorkDayController );

export default workDayRouter;
