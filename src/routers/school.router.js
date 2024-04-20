import express from "express";
import {loginController, registerController, registerCordinatorController} from "../controllers/school.controller.js";
import { schoolAuthentication } from "../middlewares/school.authentication.middleware.js";
import { cordinatorRegisterValidation, schoolLoginValidation, schoolRegisterValidation } from "../middlewares/school.validation.middleware.js";

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

schoolRouter.post("/register",schoolRegisterValidation, registerController);

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
schoolRouter.post("/login",schoolLoginValidation, loginController);

/**
 * @swagger
 * /school/register-cordinator:
 *   post:
 *     summary: To register a cordinator
 *     description: This API will register cordinator. Cordinator will manage the one section of students.
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
 *     responses:
 *       200:
 *         description: Coordinator registered successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */

schoolRouter.post("/register-cordinator",schoolAuthentication, cordinatorRegisterValidation,registerCordinatorController);

export default schoolRouter;
