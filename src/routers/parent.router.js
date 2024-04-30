import express from "express";
import {  loginParentController, registerExistingParentController, registerParentController} from "../controllers/parent.controller.js";
import { adminAuthentication } from "../middlewares/admin.authentication.middleware.js";
import { loginParentValidation,registerExistingParentValidation, registerParentValidation } from "../middlewares/parent.validation.middleware.js";

const parentRouter = express.Router();

/**
 * @swagger
 * /parent/register/{studentId}:
 *   post:
 *     security:
 *       - Authorization: []
 *     summary: Register a student's parent
 *     description: Register a student's parent with their details.
 *     tags:
 *       - Parents
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         description: ID of the student
 *         schema:
 *           type: string
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
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student parent registered successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
parentRouter.post("/register/:studentId",adminAuthentication,registerParentValidation,registerParentController)

/**
 * @swagger
 * /school/add-student-existing-parent/{studentId}:
 *   post:
 *     security:
 *       - Authorization: []
 *     summary: Register a student's parent
 *     description: Register a student's parent with their details.
 *     tags:
 *       - Parents
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         description: ID of the student
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               parentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student parent registered successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
 parentRouter.post("/add-student-existing-parent/:studentId",adminAuthentication,registerExistingParentValidation, registerExistingParentController);
  
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
parentRouter.post("/login",loginParentValidation, loginParentController);
export default parentRouter;
