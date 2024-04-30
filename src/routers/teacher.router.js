import express from "express";
import { registerTeacherController,loginTeacherController ,markTeacherAsCordinatorController,deleteTeacherController,getAllTeachersController,getAllCordinatorsController} from "../controllers/teacher.controller.js";
import { adminAuthentication } from "../middlewares/admin.authentication.middleware.js";
import { registerTeacherValidation, loginTeacherValidation,markTeacherAsCordinatorValidation,deleteTeacherValidation} from "../middlewares/teacher.validation.middleware.js";

const teacherRouter = express.Router();


/**
 * @swagger
 * /teacher/register:
 *   post:
 *     security:
 *       - Authorization: []
 *     summary: To register a coordinator
 *     description: This API will register a coordinator. The coordinator will manage one section of students.
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
 *     summary: To login a cordinator
 *     description: This API will allow to login registered cordinator.
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
teacherRouter.post("/login", loginTeacherValidation, loginTeacherController);

/**
 * @swagger
 * /teacher/mark-teacher-as-coordinator/{teacherId}:
 *   patch:
 *     security:
 *       - Authorization: []
 *     summary: Mark teacher as coordinator
 *     description: Mark a teacher as coordinator.
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
teacherRouter.patch("/mark-teacher-as-cordinator/:teacherId",adminAuthentication,markTeacherAsCordinatorValidation,markTeacherAsCordinatorController);
  
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
teacherRouter.delete("/:cordinatorId",adminAuthentication, deleteTeacherValidation,deleteTeacherController );

  /**
 * @swagger
 * /school/all-cordinators:
 *   get:
 *     security:
 *       - Authorization: []
 *     summary: get list of all cordinators.
 *     description: get list of all cordinators.
 *     tags:
 *       - School
 *     responses:
 *       200:
 *         description: Teacher marked as coordinator successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
teacherRouter.get("/all-cordinators",adminAuthentication, getAllCordinatorsController );

  /**
 * @swagger
 * /school/all-teachers:
 *   get:
 *     security:
 *       - Authorization: []
 *     summary: get list of all teachers.
 *     description: get list of all teachers.
 *     tags:
 *       - School
 *     responses:
 *       200:
 *         description: Teacher marked as coordinator successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
teacherRouter.get("/all-teachers", adminAuthentication, getAllTeachersController);


export default teacherRouter;
