import express from 'express';
import { adminAuthentication } from '../middlewares/authentication/admin.authentication.middleware.js';
import { createHolidayEventValidation } from '../middlewares/validation/holidayEvent.validation.middleware.js';
import { createHolidayEventController, deleteHolidayEventController, getHolidayEventController } from '../controllers/holidayEvent.controller.js';

const holidayEventRouter = express.Router();

holidayEventRouter.post("/create-event",adminAuthentication,createHolidayEventValidation,createHolidayEventController);
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