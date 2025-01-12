import { error, success } from "../utills/responseWrapper.js";
import { StatusCodes } from "http-status-codes";
import { getSectionAttendanceStatusService } from "../services/sectionAttendance.services.js";
import { getSectionService } from "../services/section.services.js";

export async function attendanceStatusOfSectionController(req, res) {
  try {
    const sectionId = req.sectionId;
    const {startTime, endTime} = req.body;
    if(!sectionId){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Section Id not found"));
    }
    const section = await getSectionService({_id: sectionId});
    if(!section){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Section not found"));
    }
    const totalStudent = section["studentCount"];
    const sectionAttendance = await getSectionAttendanceStatusService({date:{$gte: startTime, $lte: endTime}, section:sectionId});
    return res.status(StatusCodes.OK).send(success(200, {section:sectionId, totalStudent, sectionAttendance}));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}