import {getDayNameService, getStartAndEndTimeService } from "../services/celender.service.js";
import { createHolidayService, deleteHolidayService, getHolidaysService, updateHolidayService, getHolidayService } from "../services/holiday.service.js";
import { error, success } from "../utills/responseWrapper.js";
import { StatusCodes } from "http-status-codes";

export async function registerHolidayController(req, res) {
  try {
    const { title, description } = req.body;
    let date = new Date(req.body["date"]);
    const adminId = req.adminId;
    const day = getDayNameService(date.getDay());

    if(day==='Sunday') {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Sunday can't marked as holiday"));
    }

    const { startTime, endTime } = getStartAndEndTimeService(date, date);
    date = date.getTime();

    let holiday = await getHolidayService({admin: adminId, date: { $gte: startTime, $lte: endTime }});
    if (holiday) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Holiday event already exists"));
    }
    const data = { date, day, title, description, admin: adminId };
    await createHolidayService(data);
    return res.status(StatusCodes.OK).send(success(200, "Holiday created sucessfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function getHolidaysController(req, res) {
  try {
    let { startTime, endTime } = req.body;
    const adminId = req.adminId;
    const holidays = await getHolidaysService({admin: adminId, date: { $gte: startTime, $lte: endTime } });
    return res.status(StatusCodes.OK).send(success(200, holidays));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateHolidayController(req, res) {
  try {
    const id = req.params.eventId;
    const { title, description } = req.body;
    let holiday = await getHolidayService({ _id: id });

    if (!holiday) {
      return res.status(StatusCodes.NOT_FOUND).send(error(400, "holiday not found."));
    }
    const fieldsToBeUpdated = {};
    if (title) {
      fieldsToBeUpdated["title"] = title;
    }
    if (description) {
      fieldsToBeUpdated["description"] = description;
    }

    await updateHolidayService({_id: id}, fieldsToBeUpdated);
    return res.status(StatusCodes.OK).send(success(200, "Holiday updated successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function deleteHolidayController(req, res) {
  try {
    const id = req.params.eventId;
    const holiday = await getHolidayService({ _id: id });
    if (!holiday) {
      return res.status(StatusCodes.NOT_FOUND).send(error(400, "Holiday doesn't exists"));
    }
    await deleteHolidayService({ _id: id });
    return res.status(StatusCodes.OK).send(success(200, "Holiday deleted successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}
