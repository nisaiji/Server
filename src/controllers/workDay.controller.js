import { createWorkDayService, deleteWorkDayService, getWorkDayService, getWorkDaysService, updateWorkDayService } from "../services/workDay.services.js";
import { getDayNameService, getStartAndEndTimeService } from "../services/celender.service.js";
import { error, success } from "../utills/responseWrapper.js";
import { StatusCodes } from "http-status-codes";

export async function registerWorkDayController(req, res) {
  try {
    const { title, description } = req.body;
    let date = new Date(req.body["date"]);
    const adminId = req.adminId;
    const day = getDayNameService(date.getDay());

    if(day !== 'Sunday') {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "It is already working day"));
    }
    const { startTime, endTime } = getStartAndEndTimeService(date, date);
    date = date.getTime();

    let workDay = await getWorkDayService({admin: adminId, date: { $gte: startTime, $lte: endTime }});
    if (workDay) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Already marked as working day"));
    }
    const data = { date, day, title, description, admin: adminId };
    await createWorkDayService(data);
    return res.status(StatusCodes.OK).send(success(200, "Marked as working day successfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function getWorkDaysController(req, res) {
  try {
    let { startTime, endTime } = req.body;
    const adminId = req.adminId;
    const workDays = await getWorkDaysService({ admin: adminId, date: { $gte: startTime, $lte: endTime } });
    return res.status(StatusCodes.OK).send(success(200, workDays));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateWorkDayController(req, res) {
  try {
    const id = req.params.workDayId;
    const { title, description } = req.body;
    let workDay = await getWorkDayService({ _id: id });

    if (!workDay) {
      return res.status(StatusCodes.NOT_FOUND).send(error(400, "Work day not found"));
    }
    const fieldsToBeUpdated = {};
    if (title) {
      fieldsToBeUpdated["title"] = title;
    }
    if (description) {
      fieldsToBeUpdated["description"] = description;
    }

    await updateWorkDayService({_id: id}, fieldsToBeUpdated);
    return res.status(StatusCodes.OK).send(success(200, "Workday updated successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function deleteWorkDayController(req, res) {
  try {
    const id = req.params.workDayId;
    const workday = await getWorkDayService({ _id: id });
    if (!workday) {
      return res.status(StatusCodes.NOT_FOUND).send(error(400, "Workday not found"));
    }
    await deleteWorkDayService({ _id: id });
    return res.status(StatusCodes.OK).send(success(200, "Workday deleted successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}
