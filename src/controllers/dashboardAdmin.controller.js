import { getSectionService } from "../services/section.services.js";
import { getAttendanceCountService } from "../services/attendance.service.js";
import { error, success } from "../utills/responseWrapper.js";
import { StatusCodes } from "http-status-codes";
import { getSectionAttendanceStatusService, getSectionAttendancesPipelineService } from "../services/sectionAttendance.services.js";
import { getStudentCountService, getStudentsPipelineService } from "../services/student.service.js";
import { getParentCountService } from "../services/parent.services.js";
import { getTeacherCountService } from "../services/teacher.services.js";
import { convertToMongoId } from "../services/mongoose.services.js";
import { getSessionService } from "../services/session.services.js";
import { getSessionStudentCountService } from "../services/v2/sessionStudent.service.js";

export async function getPresentStudentsController(req,res){
  try {
    const adminId = req.adminId;
    const {startTime, endTime, sessionId} = req.body;
    const session = await getSessionService({_id:sessionId, school:adminId});
    if(!session){ 
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session not found"));
    }
    if(session['status'] === 'completed'){ 
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session Completed"));
    }
    const [presentCount, absentCount, totalCount] = await Promise.all([
      getAttendanceCountService({admin:adminId, session: sessionId, date:{$gte:startTime, $lte:endTime}, teacherAttendance:"present"}),
      getAttendanceCountService({admin:adminId, session: sessionId, date:{$gte:startTime, $lte:endTime}, teacherAttendance:"absent"}),
      getSessionStudentCountService({school:adminId, session: sessionId, isActive:true})
    ]);
    return res.status(StatusCodes.OK).send(success(200,{presentCount, absentCount, totalCount}));    
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500,err.message));  
  }
}

export async function getParentCountController(req,res){
  try {
    const adminId = req.adminId;
    const pipeline = [
      {
        $match: { admin: convertToMongoId(adminId) }
      },
      {
        $group: { _id: "$parent" }
      },
      {
        $count: "totalParent"
      }
    ]
    const studentObj = await getStudentsPipelineService(pipeline);
    const parentCount = studentObj.length > 0 ? studentObj[0].totalParent : 0;
    return res.status(StatusCodes.OK).send(success(200,{parentCount}));    
  } catch(err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500,err.message));  
  }
}

export async function getTeacherCountController(req,res){
  try {
    const adminId = req.adminId;
    const teacherCount = await getTeacherCountService({ admin: adminId });
    return res.status(StatusCodes.OK).send(success(200,{teacherCount}));    
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500,err.message));  
  }
}

export async function attendanceStatusOfSectionController(req, res) {
  try {
    const sectionId = req.params.sectionId;
    const {startTime, endTime} = req.body;
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

export async function attendanceStatusController(req, res) {
  try {
    const { startTime, endTime } = req.body;
    const adminId = req.adminId ? req.adminId : req.params.adminId;
    const pipeline = [
      {
        $lookup: {
          from: "sections",
          localField: "section",
          foreignField: "_id",
          as: "sectionDetails",
        },
      },
      { $unwind: "$sectionDetails" },
      { $match: { "sectionDetails.admin": convertToMongoId(adminId) } },
      {
        $match: {
          date: { $gte: startTime, $lte: endTime },
        },
      },
      {
        $addFields: {
          formattedDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: { $toDate: "$date" },
              timezone: "Asia/Kolkata",
            },
          },
        },
      },
      {
        $group: {
          _id: "$formattedDate",
          presentCount : { $sum: "$presentCount" },
          absentCount : { $sum: "$absentCount" },
        },
      },
      {
        $addFields: {
          timestamp: { $toLong: { $toDate: "$_id" }}
        },
      },
      {
        $project: {
          _id: 0,
          date: "$timestamp",
          presentCount: 1,
          absentCount: 1,
        }
      },
      {
        $sort: { _id: 1 },
      },
    ];

    const attendances = await getSectionAttendancesPipelineService(pipeline);
    const totalStudents = await getStudentCountService({ admin: adminId, isActive: true });

    return res.status(StatusCodes.OK).send(success(200, {totalStudents, attendances })); 
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}
