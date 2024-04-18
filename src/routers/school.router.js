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
 *     summary: To register school
 *     description: This API will register school.one adminName will represent to school.
 *     tags:
 *       - School
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
 *         description: "school registered successfully"
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
 *     summary: To login school
 *     description: "This is used for login school"
 *     tags:
 *       - School
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
 *         description: "school admin logged in successfully"
 *       400:
 *         description: "Unauthorized!"
 *       500:
 *         description: "Server side error"
 */
schoolRouter.post("/login", loginController);

export default schoolRouter;
