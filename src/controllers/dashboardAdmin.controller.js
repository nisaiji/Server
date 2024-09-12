import { getSectionService } from "../services/section.services.js";
import { getAttendancesService } from "../services/attendance.service.js";
import { getParentsCountOfSchoolService, getStudentsCountOfSchoolService, getTeachersCountOfSchoolService } from "../services/dashboardAdmin.services.js";
import { error, success } from "../utills/responseWrapper.js";
import { StatusCodes } from "http-status-codes";
import { getSectionAttendanceStatusService } from "../services/sectionAttendance.services.js";

export async function getPresentStudentsController(req,res){
  try {
    const adminId = req.adminId;
    const {startTime, endTime} = req.body;
    const [presentAttendances, totalCount] = await Promise.all([
      getAttendancesService({admin:adminId, date:{$gte:startTime, $lte:endTime}, teacherAttendance:"present"}),
      getStudentsCountOfSchoolService(adminId)
    ]);
    return res.status(StatusCodes.OK).send(success(200,{presentCount:presentAttendances.length, totalCount}));    
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500,err.message));  
  }
}

export async function getParentCountController(req,res){
  try {
    const adminId = req.adminId;
    const parentCount = await getParentsCountOfSchoolService(adminId);
    return res.status(StatusCodes.OK).send(success(200,{parentCount}));    
  } catch(err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500,err.message));  
  }
}

export async function getTeacherCountController(req,res){
  try {
    const adminId = req.adminId;
    const teacherCount = await getTeachersCountOfSchoolService(adminId);
    return res.status(StatusCodes.OK).send(success(200,{teacherCount}));    
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500,err.message));  
  }
}

export async function attendanceStatusOfSectionController(req, res) {
  try {
    const sectionId = req.sectionId;
    const {startTime, endTime} = req.body;
    const section = await getSectionService({_id: sectionId});
    const totalStudent = section["studentCount"];
    const sectionAttendance = await getSectionAttendanceStatusService({date:{$gte: startTime, $lte: endTime}, section:sectionId});
    return res.status(StatusCodes.OK).send(success(200, {section:sectionId, totalStudent, sectionAttendance}));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}
