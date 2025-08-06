import { convertToMongoId } from "../services/mongoose.services.js";
import { getStudentLeaveRequestsPipelineService, registerStudentLeaveRequestService } from "../services/studentLeaveRequest.service.js";
import { getSessionStudentService } from "../services/v2/sessionStudent.service.js";
import StatusCodes from "http-status-codes";
import { error, success } from "../utills/responseWrapper.js";

export async function registerStudentLeaveRequestController(req, res){
  try {
    const { reason, description, startDate, endDate, sessionStudentId } = req.body;
    const parentId = req.parentId;

    if(startDate > endDate){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, 'Start Time must be less than End Time'))
    }

    const sessionStudent = await getSessionStudentService({_id: sessionStudentId});
    if(!sessionStudent){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, 'Session Student not found'));
    }

    const pipeline = [
      {
        $match: {
          parent: convertToMongoId(parentId),
          startDate: {$lte: endDate},
          endDate: {$gte: startDate}
        }
      }
    ];

  const leaveRequests = await getStudentLeaveRequestsPipelineService(pipeline);
  if(leaveRequests.length > 0) {
    const startDate = new Date(leaveRequests[0].startTime);
    const endDate = new Date(leaveRequests[0].endTime);
    return res.status(StatusCodes.CONFLICT).send(error(409, `Leave already requested from ${startDate} to ${endDate}.`));
  }

  const leaveRequestObj = {
    reason,
    description,
    parent: convertToMongoId(parentId),
    sessionStudent: convertToMongoId(sessionStudentId),
    student: convertToMongoId(sessionStudent.student),
    section: convertToMongoId(sessionStudent.section),
    school: convertToMongoId(sessionStudent.school),
    startDate,
    endDate
  }
  await registerStudentLeaveRequestService(leaveRequestObj);
  return res.status(StatusCodes.OK).send(success(200, "Request sent successfully"));

  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getStudentLeaveRequestForTeacherController(req, res) {
  try {
    const {startDate, endDate} = req.body;
    const teacherId = req.teacherId;
    const sectionId = req.sectionId;
    const schoolId = req.adminId;

    const filter = {
      school: convertToMongoId(schoolId),
      section: convertToMongoId(sectionId),
      startDate:{$gte: startDate},
      endDate:{$lte: endDate}
    }

    console.log({filter});

    const pipeline = [
      {
        $match: filter
      },
      {
        $lookup: {
          from: "sessionstudents",
          localField: "sessionStudent",
          foreignField: "_id",
          as: "sessionStudentDetails"
        }
      },
      {
        $unwind: "$sessionStudentDetails"
      },
      {
        $lookup: {
          from: "students",
          localField: "sessionStudentDetails.student",
          foreignField: "_id",
          as: "studentDetails"
        }
      }
    ];

    const leaveRequests = await getStudentLeaveRequestsPipelineService(pipeline);
    if(leaveRequests.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "No leave requests found"));
    } 
    return res.status(StatusCodes.OK).send(success(200, leaveRequests));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}