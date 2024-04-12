import express from 'express';
import { loginController, registerController } from '../controllers/school.controller.js';

const schoolRouter = express.Router();

schoolRouter.post("/register",registerController);
schoolRouter.post("/login",loginController);

export default schoolRouter;