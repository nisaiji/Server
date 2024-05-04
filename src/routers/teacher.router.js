import express from "express";
import { registerTeacherController,markTeacherAsClassTeacherController,deleteTeacherController,getAllTeachersController, loginClassTeacherController, getAllClassTeachersController} from "../controllers/teacher.controller.js";
import { adminAuthentication } from "../middlewares/authentication/admin.authentication.middleware.js";
import { deleteTeacherValidation, loginClassTeacherValidation, markTeacherAsClassTeacherValidation, registerTeacherValidation } from "../middlewares/validation/teacher.validation.middleware.js";

const teacherRouter = express.Router();

/**
 * @swagger
 * /teacher/register:
 *   post:
 *     security:
 *       - Authorization: []
 *     summary: To register a teacher
 *     description: This API will register a teacher. The teacher will manage one section of students.
 *     tags:
 *       - Teacher
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
 *         description: teacher registered successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
teacherRouter.post("/register",adminAuthentication, registerTeacherValidation,  registerTeacherController);

/**
 * @swagger
 * /teacher/login:
 *   post:
 *     summary: To login a teacher
 *     description: This API will allow a teacher to login.
 *     tags:
 *       - Teacher
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
 *         description: teacher logged in successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
teacherRouter.post("/login", loginClassTeacherValidation, loginClassTeacherController);

/**
 * @swagger
 * /teacher/mark-teacher-as-class-teacher/{teacherId}:
 *   patch:
 *     security:
 *       - Authorization: []
 *     summary: Mark teacher as class-teacher
 *     description: Mark a teacher as class-teacher.
 *     tags:
 *       - Teacher
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
 *         description: Teacher marked as class-teacher successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
teacherRouter.patch("/mark-teacher-as-class-teacher/:teacherId",adminAuthentication,markTeacherAsClassTeacherValidation,markTeacherAsClassTeacherController);

  /**
 * @swagger
 * /teacher/{teacherId}:
 *   delete:
 *     security:
 *       - Authorization: []
 *     summary: Delete teacher
 *     description: Delete teacher.
 *     tags:
 *       - Teacher
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
teacherRouter.delete("/:teacherId",adminAuthentication, deleteTeacherValidation,deleteTeacherController );

  /**
 * @swagger
 * /teacher/all-class-teachers:
 *   get:
 *     security:
 *       - Authorization: []
 *     summary: get list of all cordinators.
 *     description: get list of all cordinators.
 *     tags:
 *       - Teacher
 *     responses:
 *       200:
 *         description: featched a list of cordinators successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
teacherRouter.get("/all-class-teachers",adminAuthentication, getAllClassTeachersController );

  /**
 * @swagger
 * /teacher/all-teachers:
 *   get:
 *     security:
 *       - Authorization: []
 *     summary: get list of all teachers.
 *     description: get list of all teachers.
 *     tags:
 *       - Teacher
 *     responses:
 *       200:
 *         description: featched a list of teachers successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
teacherRouter.get("/all-teachers", adminAuthentication, getAllTeachersController);



export default teacherRouter;