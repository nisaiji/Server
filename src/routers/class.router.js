import express from 'express';
import { registerClassController } from '../controllers/class.controller.js';
import { adminAuthentication } from '../middlewares/authentication/admin.authentication.middleware.js';

const classRouter = express.Router();

/**
 * @swagger
 * /class/register:
 *   post:
 *     security:
 *       - Authorization: []
 *     summary: To create a class
 *     description: This API will create a class.it requires admin login token.
 *     tags:
 *       - Class
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: class created successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
classRouter.post("/register",adminAuthentication, registerClassController);

/**
 * @swagger
 * /class/{classId}:
 *   delete:
 *     security:
 *       - Authorization: []
 *     summary: To delete a class
 *     description: This API will delete a class and its all sections.it requires admin login token.
 *     tags:
 *       - Class
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         description: ID of the class
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: class deleted successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
classRouter.delete("/:classId",adminAuthentication, registerClassController);


export default classRouter;