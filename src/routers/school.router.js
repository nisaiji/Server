import express from "express";
import {
  loginController,
  registerController
} from "../controllers/school.controller.js";

const schoolRouter = express.Router();

/**
 * @swagger
 * /school/register:
 *   post:
 *     summary: "This is register API"
 *     description: "This is used to register school"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               affiliationNo:
 *                 type: string
 *               address:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               adminName:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: "User registered successfully"
 *       400:
 *         description: "Unauthorized!"
 *       500:
 *         description: "Server side error"
 */

schoolRouter.post("/register", registerController);

/**
 * @swagger
 * /school/login:
 *   post:
 *     summary: "This is login API"
 *     description: "This is used for login school"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminName:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: "User login successfully"
 *       400:
 *         description: "Unauthorized!"
 *       500:
 *         description: "Server side error"
 */
schoolRouter.post("/login", loginController);

export default schoolRouter;
