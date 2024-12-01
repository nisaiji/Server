import express from 'express';
import { updateGuestTeacherController } from "../controllers/guestTeacher.controller.js";
import { loginGuestTeacherValidation } from "../middlewares/validation/guestTeacher.validation.middleware.js";

const guestTeacherRouter = express.Router();

guestTeacherRouter.put("/", loginGuestTeacherValidation, updateGuestTeacherController)

export default guestTeacherRouter;
