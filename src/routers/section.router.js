import express from "express";
import {deleteSectionController,getAllSectionsController,getClassSectionsController,registerSectionController,} from "../controllers/section.controller.js";
import { adminAuthentication } from "../middlewares/authentication/admin.authentication.middleware.js";
import { deleteSectionAuthorization } from "../middlewares/authorization/deleteSection.authorization.middleware.js";
import { registerSectionValidation } from "../middlewares/validation/section.validation.middleware.js";
// import { adminAuthentication } from "../middlewares/admin.authentication.middleware.js";
// import { registerSectionValidation } from "../middlewares/section.validation.middleware.js";

const sectionRouter = express.Router();
/**
 * @swagger
 * /section/register:
 *   post:
 *     security:
 *       - Authorization: []
 *     summary: To register a class-section
 *     description: This API will register a class-section.it requires admin login token.
 *     tags:
 *       - Section
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               teacherId:
 *                 type: string
 *               classId:
 *                 type: string
 *     responses:
 *       200:
 *         description: section registered successfully
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
sectionRouter.post("/register",adminAuthentication,registerSectionValidation,registerSectionController);

/**
 * @swagger
 * /section/all:
 *   get:
 *     security:
 *       - Authorization: []
 *     summary: get list of all sections.
 *     description: This API will get you a list of all sections along with students list and cordinator.It requires admin login token.
 *     tags:
 *       - Section
 *     responses:
 *       200:
 *         description: section list featched successfully.
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
sectionRouter.get("/all", adminAuthentication, getAllSectionsController);

/**
 * @swagger
 * /section/{classId}:
 *   get:
 *     security:
 *       - Authorization: []
 *     summary: get list of all sections of particular class.
 *     description: This API will get you a list of all sections along with students list and cordinator.It requires admin login token.
 *     tags:
 *       - Section
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         description: ID of the class
 *     responses:
 *       200:
 *         description: section list featched successfully.
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
sectionRouter.get("/:classId", adminAuthentication, getClassSectionsController);

/**
 * @swagger
 * /section/{sectionId}:
 *   delete:
 *     security:
 *       - Authorization: []
 *     summary: To delete a section.
 *     description: This API will delete a section,and unlink students,class teacher from that section.It requires admin login token.
 *     tags:
 *       - Section
 *     parameters:
 *       - in: path
 *         name: sectionId
 *         required: true
 *         description: ID of the section
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: section deleted successfully.
 *       400:
 *         description: Unauthorized request
 *       500:
 *         description: Server error
 */
sectionRouter.delete("/:sectionId",adminAuthentication,deleteSectionAuthorization,deleteSectionController);

export default sectionRouter;