import express from 'express';
import { adminAuthentication } from '../middlewares/authentication/admin.authentication.middleware.js';
import { createHolidayEventValidation } from '../middlewares/validation/holidayEvent.validation.middleware.js';
import { createHolidayEventController, deleteHolidayEventController, getHolidayEventController } from '../controllers/holidayEvent.controller.js';

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

/**
 * @swagger
 * /holiday-event/:
 *   get:
 *     security:
 *       - Authorization: []
 *     summary: get a list of holiday events.
 *     description: This API will fetch you holiday event list. it requires admin login token.
 *     tags:
 *       - Holiday Event
 *     responses:
 *       200:
 *         description: Holiday event fetched successfully
 *       400:
 *         description: Unauthorized!
 *       500:
 *         description: Server side error
 */
holidayEventRouter.get("/",adminAuthentication,getHolidayEventController);

/**
 * @swagger
 * /holiday-event/{eventId}:
 *   delete:
 *     security:
 *       - Authorization: []
 *     summary: To delete the event by eventId.
 *     description: This API will delete the event by eventId. it requires admin login token.
 *     tags:
 *       - Holiday Event
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: ID of the holiday event.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Holiday deleted successfully.
 *       400:
 *         description: Unauthorized!
 *       500:
 *         description: Server side error.
 */
holidayEventRouter.delete("/:eventId",adminAuthentication,deleteHolidayEventController);



export default holidayEventRouter;