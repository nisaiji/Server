import express from "express";
import {
  addToSectionStudentController,
  adminRegisterStudentController,
  adminUpdateStudentController,
  deleteStudentController,
  getStudentListOfSectionController,
  getStudentListOfSectionForAdminController,
  registerStudentController,
} from "../controllers/student.controller.js";

import { adminAuthentication } from "../middlewares/authentication/admin.authentication.middleware.js";
import { classTeacherAuthentication } from "../middlewares/authentication/classTeacher.authentication.middleware.js";
import {
  addToSectionStudentValidation,
  adminRegisterStudentValidation,
  deleteStudentValidation,
  registerStudentValidation,
} from "../middlewares/validation/student.validation.middleware.js";
import { adminUpdateStudent } from "../services/student.service.js";

const studentRouter = express.Router();

/**
 * @swagger
 * /student/register:
 *   post:
 *     security:
 *       - Authorization: []
 *     summary: Register a student
 *     description: This API will register a student with their details.it requires classTeacher login token.
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
studentRouter.post(
  "/register",
  classTeacherAuthentication,
  registerStudentValidation,
  registerStudentController
);

/**
 * @swagger
 * /student/admin-register:
 *   post:
 *     security:
 *       - Authorization: []
 *     summary: Register a student
 *     description: This API will register a student with their details.it requires admin login token.
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
 *               address:
 *                 type: string
 *               sectionId:
 *                 type: string
 *               classId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student registered successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
studentRouter.post(
  "/admin-register",
  adminAuthentication,
  adminRegisterStudentValidation,
  adminRegisterStudentController
);

/**
 * @swagger
 * /student/{studentId}:
 *   delete:
 *     security:
 *       - Authorization: []
 *     summary: delete student
 *     description: This api will delete student from database.it requires admin login token.
 *     tags:
 *       - Student
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         description: ID of the student
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: student deleted successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
studentRouter.delete(
  "/:studentId",
  adminAuthentication,
  deleteStudentValidation,
  deleteStudentController
);

/**
 * @swagger
 * /student/student-list/{sectionId}/{pageNo}:
 *   get:
 *     security:
 *       - Authorization: []
 *     summary: get a list of student of that section.
 *     description: This api will fetch list of students of that section. it requires class-teacher login token.
 *     tags:
 *       - Student
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         description: ID of the student
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: student deleted successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
studentRouter.get(
  "/student-list/:sectionId/:pageNo",
  classTeacherAuthentication,
  getStudentListOfSectionController
);

/**
 * @swagger
 * /student/admin-student-list/{sectionId}/{pageNo}:
 *   get:
 *     security:
 *       - Authorization: []
 *     summary: get a list of student of that section.
 *     description: This api will fetch list of students of that section. it requires class-teacher login token.
 *     tags:
 *       - Student
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         description: ID of the student
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: student deleted successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
studentRouter.get(
  "/admin-student-list/:sectionId/:pageNo",
  adminAuthentication,
  getStudentListOfSectionForAdminController
);


/**
 * @swagger
 * /student/admint-upate-student/{studentId}:
 *   put:
 *     security:
 *       - Authorization: []
 *     summary: Update a student's details
 *     description: This API updates a student's details. It requires an admin login token.
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
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Teacher updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
studentRouter.put(
  "/admin-update-student/:studentId",
  adminAuthentication,
  adminUpdateStudentController
);

export default studentRouter;
