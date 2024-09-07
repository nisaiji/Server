import {getDayNameService, getStartAndEndTimeService } from "../services/celender.service.js";
import { getAdminService } from "../services/admin.services.js";
import {createHolidayEventService, deleteHolidayEventService, getHolidayEventsService, getHolidayEventService, updateHolidayEventService } from "../services/holidayEvent.service.js";
import { error, success } from "../utills/responseWrapper.js";
import { StatusCodes } from "http-status-codes";


export async function createHolidayEventController(req, res) {
  try {
    const { title, holiday, event, description } = req.body;
    let date = new Date(req.body["date"]);
    const adminId = req.adminId;
    const day = getDayNameService(date.getDay());

    const { startTime, endTime } = getStartAndEndTimeService(date, date);
    date = date.getTime();
    let holidayEvent = await getHolidayEventService({
      admin: adminId,
      date: { $gte: startTime, $lte: endTime }
    });
    if (holidayEvent) {
      return res
        .status(StatusCodes.CONFLICT)
        .send(error(409, "Holiday event already exists"));
    }
    const data = { date, day, title, holiday, event, description, admin:adminId };
    await createHolidayEventService(data);

    return res
      .status(StatusCodes.OK)
      .send(success(200, "Holiday event has been created sucessfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function getHolidayEventController(req, res) {
  try {
    let { startTime, endTime } = req.body;
    const adminId = req.adminId;

    const holidayEvents = await getHolidayEventsService({
      admin: adminId,
      date: { $gte: startTime, $lte: endTime }
    });
    return res.status(StatusCodes.OK).send(success(200, holidayEvents));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateHolidayEventController(req, res) {
  try {
    const id = req.params.eventId;
    const { title, description, holiday, event } = req.body;
    let holidayEvent = await getHolidayEventService({ _id: id });

    if (!holidayEvent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(400, "Event not found."));
    }
    const fieldsToBeUpdated = {};
    if (title){ fieldsToBeUpdated["title"] = title; }
    if (description){ fieldsToBeUpdated["description"] = description; }
    if (req.body.hasOwnProperty("event")){ fieldsToBeUpdated["event"] = event; }
    if (req.body.hasOwnProperty("holiday")){ fieldsToBeUpdated["holiday"] = holiday; }

    await updateHolidayEventService({ id, fieldsToBeUpdated });
    return res.status(StatusCodes.OK).send(success(200, "Holiday event updated successfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function deleteHolidayEventController(req, res) {
  try {
    const id = req.params.eventId;
    const event = await getHolidayEventService({ _id: id });
    if (!event) {
      return res.status(StatusCodes.NOT_FOUND).send(error(400, "Event doesn't exists"));
    }
    const deletedEvent = await deleteHolidayEventService({ _id: id });
    return res.status(StatusCodes.OK).send(success(200, "Event deleted successfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}


