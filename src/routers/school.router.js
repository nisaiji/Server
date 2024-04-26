import express from "express";
import {deleteCordinatorController, loginController, markTeacherAsCordinatorController, registerController, registerCordinatorController, registerExistingParentController, registerParentController, registerSectionController, registerStudentController, studentAddToSectionController} from "../controllers/school.controller.js";
import { existingParentRegisterValidation, parentRegisterValidation } from "../middlewares/parent.validation.middleware.js";
import { schoolAuthentication } from "../middlewares/school.authentication.middleware.js";
import { cordinatorRegisterValidation, schoolLoginValidation, schoolRegisterValidation, sectionRegisterValidation, studentAddToSectionValidation, studentRegisterValidation } from "../middlewares/school.validation.middleware.js";
import { cordinatorDeleteValidation, teacherValidation } from "../middlewares/cordinator.validation.middleware.js";

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
 *     security:
 *       - Authorization: []
 *     summary: To register a coordinator
 *     description: This API will register a coordinator. The coordinator will manage one section of students.
 *     tags:
 *       - School
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

 /**
 * @swagger
 * /school/register-class-section:
 *   post:
 *     security:
 *       - Authorization: []
 *     summary: To register a class-section
 *     description: This API will register a class-section. The coordinator will manage one section of students.
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
 *               cordinatorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: section registered successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
 schoolRouter.post("/register-class-section",schoolAuthentication, sectionRegisterValidation,registerSectionController);

/**
 * @swagger
 * /school/register-student:
 *   post:
 *     security:
 *       - Authorization: []
 *     summary: Register a student
 *     description: Register a student with their details.
 *     tags:
 *       - School
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
 schoolRouter.post("/register-student",schoolAuthentication,studentRegisterValidation,registerStudentController);

 /**
 * @swagger
 * /school/add-student-to-section/{studentId}:
 *   post:
 *     security:
 *       - Authorization: []
 *     summary: Register a student
 *     description: Register a student with their details.
 *     tags:
 *       - School
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
 *         description: Student registered successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
 schoolRouter.post("/add-student-to-section/:studentId",schoolAuthentication,studentAddToSectionValidation, studentAddToSectionController)

/**
 * @swagger
 * /school/register-student-parent/{studentId}:
 *   post:
 *     security:
 *       - Authorization: []
 *     summary: Register a student's parent
 *     description: Register a student's parent with their details.
 *     tags:
 *       - School
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
 schoolRouter.post("/register-student-parent/:studentId",schoolAuthentication,parentRegisterValidation,registerParentController);

 /**
 * @swagger
 * /school/add-student-existing-parent/{studentId}:
 *   post:
 *     security:
 *       - Authorization: []
 *     summary: Register a student's parent
 *     description: Register a student's parent with their details.
 *     tags:
 *       - School
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
 schoolRouter.post("/add-student-existing-parent/:studentId",schoolAuthentication,existingParentRegisterValidation,registerExistingParentController);

/**
 * @swagger
 * /school/mark-teacher-as-coordinator/{teacherId}:
 *   patch:
 *     security:
 *       - Authorization: []
 *     summary: Mark teacher as coordinator
 *     description: Mark a teacher as coordinator.
 *     tags:
 *       - School
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
 schoolRouter.patch("/mark-teacher-as-cordinator/:teacherId",schoolAuthentication,teacherValidation,markTeacherAsCordinatorController);

 /**
 * @swagger
 * /school/delete-cordinator/{teacherId}:
 *   delete:
 *     security:
 *       - Authorization: []
 *     summary: Mark teacher as coordinator
 *     description: Mark a teacher as coordinator.
 *     tags:
 *       - School
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
 schoolRouter.delete("/delete-cordinator/:cordinatorId",schoolAuthentication,cordinatorDeleteValidation,deleteCordinatorController);

 export default schoolRouter;
