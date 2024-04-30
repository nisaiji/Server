import express from "express";
import { addToSectionStudentController, deleteStudentController, registerStudentController } from "../controllers/student.controller.js";
import { adminAuthentication } from "../middlewares/admin.authentication.middleware.js";
import { addToSectionStudentValidation, deleteStudentValidation, registerStudentValidation } from "../middlewares/student.validation.middleware.js";

const studentRouter = express.Router();

/**
 * @swagger
 * /student/register:
 *   post:
 *     security:
 *       - Authorization: []
 *     summary: Register a student
 *     description: Register a student with their details.
 *     tags:
 *       - Student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rollNumber:
 *                 type: string
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: ["Male", "Female", "Non-binary", "Other"]
 *               age:
 *                 type: number
 *                 minimum: 3
 *                 maximum: 100
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               classStd:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student registered successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
studentRouter.post("/register",adminAuthentication,registerStudentValidation, registerStudentController);

/**
 * @swagger
 * /student/add-to-section/{studentId}:
 *   post:
 *     security:
 *       - Authorization: []
 *     summary: Register a student
 *     description: Register a student with their details.
 *     tags:
 *       - Student
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
 *               rollNumber:
 *                 type: string
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: ["Male", "Female", "Non-binary", "Other"]
 *               age:
 *                 type: number
 *                 minimum: 3
 *                 maximum: 100
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               classStd:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: student added to section successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
studentRouter.post("/add-to-section",adminAuthentication,addToSectionStudentValidation,addToSectionStudentController);

/**
 * @swagger
 * /student/{studentId}:
 *   delete:
 *     security:
 *       - Authorization: []
 *     summary: Mark teacher as coordinator
 *     description: Mark a teacher as coordinator.
 *     tags:
 *       - Student
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         description: ID of the teacher
 *         schema:
 *           type: string
 *       - in: body
 *         name: body
 *         required: true
 *         description: Parent ID
 *         schema:
 *           type: object
 *           properties:
 *     responses:
 *       200:
 *         description: Teacher marked as coordinator successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
studentRouter.delete("/:studentId",adminAuthentication, deleteStudentValidation, deleteStudentController);

export default studentRouter;