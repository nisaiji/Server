import express from 'express';
import { adminAuthentication } from '../middlewares/authentication/admin.authentication.middleware.js';
import { createHolidayEventValidation } from '../middlewares/validation/holidayEvent.validation.middleware.js';
import { createHolidayEventController } from '../controllers/holidayEvent.controller.js';

const holidayEventRouter = express.Router();

/**
 * @swagger
 * /Holiday-Event/create-event:
 *   post:
 *     security:
 *       - Authorization: []
 *     summary: Create Holiday Event
 *     description: This API will create holiday event. it requires admin login token.
 *     tags:
 *       - Holiday Event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               name:
 *                 type: string
 *               teacherHoliday:
 *                 type: boolean
 *               studentHoliday:
 *                 type: boolean
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Holiday event created successfully
 *       400:
 *         description: Unauthorized!
 *       500:
 *         description: Server side error
 */
holidayEventRouter.post("/create-event",adminAuthentication,createHolidayEventValidation,createHolidayEventController);

export default holidayEventRouter;