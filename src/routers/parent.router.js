import express from "express";
import {
  loginParentController,
  registerParentController
} from "../controllers/parent.controller.js";
import { parentLoginValidation, parentRegisterValidation } from "../middlewares/parent.validation.middleware.js";

const parentRouter = express.Router();

// todo: define routers related to parent
/**
 * @swagger
 * /parent/register:
 *   post:
 *     summary: To register a parents
 *     description: This API will register parents.
 *     tags:
 *       - Parents
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Parent registered successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
parentRouter.post("/register",parentRegisterValidation, registerParentController);
/**
 * @swagger
 * /parent/login:
 *   post:
 *     summary: To login a Parent
 *     description: This API will allow to login registered parents.
 *     tags:
 *       - Parents
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
 *         description: Parent logged in successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
parentRouter.post("/login",parentLoginValidation, loginParentController);
export default parentRouter;
