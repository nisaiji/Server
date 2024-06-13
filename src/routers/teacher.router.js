import express from "express";
import { registerTeacherController,markTeacherAsClassTeacherController,deleteTeacherController,getAllTeachersController, loginClassTeacherController, getAllClassTeachersController, getTeacherListController, updateTeacherController, getTeachersController} from "../controllers/teacher.controller.js";
import { adminAuthentication } from "../middlewares/authentication/admin.authentication.middleware.js";
import { deleteTeacherValidation, loginClassTeacherValidation, markTeacherAsClassTeacherValidation, registerTeacherValidation, updateTeacherValidation } from "../middlewares/validation/teacher.validation.middleware.js";

const teacherRouter = express.Router();

/**
 * @swagger
 * /teacher/register:
 *   post:
 *     security:
 *       - Authorization: []
 *     summary: To register a teacher
 *     description: This API will register a teacher. It requires admin login token.
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
 *     description: This API will Mark a teacher as class-teacher. it requires admin login token.
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
 *     summary: To delete teacher
 *     description: This API will delete teacher. It requires admin login token.
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
 * /teacher/{teacherId}:
 *   put:
 *     security:
 *       - Authorization: []
 *     summary: Update a teacher's details
 *     description: This API updates a teacher's details. It requires an admin login token.
 *     tags:
 *       - Teacher
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         description: ID of the teacher
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
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
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
teacherRouter.put("/:teacherId",adminAuthentication, updateTeacherController);

  /**
 * @swagger
 * /teacher/all-class-teachers:
 *   get:
 *     security:
 *       - Authorization: []
 *     summary: get list of all cordinators.
 *     description: This API will get you a list of all class-teachers.
 *     tags:
 *       - Teacher
 *     responses:
 *       200:
 *         description: featched a list of class-teachers successfully.
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

/**
 * @swagger
 * /teacher/teacher-list/{pageNo}:
 *   get:
 *     security:
 *       - Authorization: []
 *     summary: To delete teacher
 *     description: This API will delete teacher. It requires admin login token.
 *     tags:
 *       - Teacher
 *     parameters:
 *       - in: path
 *         name: pageNo
 *         required: true
 *         description: page no of teacher list
 *     responses:
 *       200:
 *         description: Teacher marked as coordinator successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
teacherRouter.get("/teacher-list/:pageNo",adminAuthentication,getTeacherListController);

teacherRouter.get('/:teacherId',adminAuthentication,getTeachersController)



export default teacherRouter;