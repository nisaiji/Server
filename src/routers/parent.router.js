import express from "express";
import {  loginParentController, registerExistingParentController, registerParentController, updateParentController} from "../controllers/parent.controller.js";
import { classTeacherAuthentication } from "../middlewares/authentication/classTeacher.authentication.middleware.js";
import { parentAuthentication } from "../middlewares/authentication/parent.authentication.middleware.js";
import { loginParentValidation, registerExistingParentValidation, registerParentValidation, updateParentValidation } from "../middlewares/validation/parent.validation.middleware.js";

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
 *     responses:
 *       200:
 *         description: Student parent registered successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
parentRouter.post("/register/:studentId",classTeacherAuthentication,registerParentValidation,registerParentController)

/**
 * @swagger
 * /parent/link-student-with-existing-parent/{studentId}:
 *   post:
 *     security:
 *       - Authorization: []
 *     summary: linked student with existing parent
 *     description: linked a student with the already existing parent who registered by siblings.
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
 *         description: student linked with existing parent successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
parentRouter.post("/link-student-with-existing-parent/:studentId",classTeacherAuthentication,registerExistingParentValidation, registerExistingParentController);
  
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

/**
 * @swagger
 * /parent:
 *   put:
 *     security:
 *       - Authorization: []
 *     summary: Update parent details
 *     description: Update a student's parent credentials.
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
 *         description: Parent updated successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
parentRouter.put("/", parentAuthentication, updateParentValidation, updateParentController);
export default parentRouter;