import express from "express";
import { loginController } from "../controllers/cordinator.controller.js";
import {
  cordinatorLoginValidation,
} from "../middlewares/cordinator.validation.middleware.js";

const cordinatorRouter = express.Router();

/**
 * @swagger
 * /cordinator/login:
 *   post:
 *     summary: To login a cordinator
 *     description: This API will allow to login registered cordinator.
 *     tags:
 *       - Cordinator
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Coordinator logged in successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
cordinatorRouter.post("/login", cordinatorLoginValidation, loginController);

export default cordinatorRouter;
