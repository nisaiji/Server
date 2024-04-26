import express from "express";
import {  loginParentController} from "../controllers/parent.controller.js";
import { parentLoginValidation } from "../middlewares/parent.validation.middleware.js";

const parentRouter = express.Router();


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
