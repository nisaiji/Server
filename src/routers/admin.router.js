import express from "express";
import {loginAdminController,registerAdminController} from "../controllers/admin.controller.js";
import { adminRegisterValidation,adminLoginValidation } from "../middlewares/admin.validation.middleware.js";

const adminRouter = express.Router();

/**
 * @swagger
 * /admin/register:
 *   post:
 *     summary: To register admin
 *     description: This API will register admin.one adminName will represent to school.
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schoolName:
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
 *         description: "admin registered successfully"
 *       400:
 *         description: "Unauthorized!"
 *       500:
 *         description: "Server side error"
 */
adminRouter.post("/register", adminRegisterValidation, registerAdminController);

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: To login admin
 *     description: "This is used for login admin"
 *     tags:
 *       - Admin
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
 *         description: "admin logged in successfully"
 *       400:
 *         description: "Unauthorized!"
 *       500:
 *         description: "Server side error"
 */
adminRouter.post("/login", adminLoginValidation, loginAdminController);


export default adminRouter;
