import express from "express";
import {
  cordinatorRegister,
  loginController
} from "../controllers/cordinator.controller.js";

const cordinatorRouter = express.Router();

/**
 * @swagger
 * /cordinator/register:
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
cordinatorRouter.post("/register", cordinatorRegister);
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
 *         description: Coordinator registered successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
cordinatorRouter.post("/login", loginController);

export default cordinatorRouter;
