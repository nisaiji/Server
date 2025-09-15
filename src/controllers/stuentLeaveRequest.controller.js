import { convertToMongoId } from "../services/mongoose.services.js";
import { deleteStudentLeaveRequestsService, getStudentLeaveRequestService, getStudentLeaveRequestsPipelineService, registerStudentLeaveRequestService, updateStudentLeaveRequestService } from "../services/studentLeaveRequest.service.js";
import { getSessionStudentService } from "../services/v2/sessionStudent.service.js";
import StatusCodes from "http-status-codes";
import { error, success } from "../utills/responseWrapper.js";
import { updateLeaveRequestService } from "../services/leave.service.js";

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
    return res.status(StatusCodes.OK).send(success(200, leaveRequests));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getStudentLeaveRequestForParentController(req, res) {
  try {
    const {startDate, endDate, sessionStudentId} = req.body;
    const parentId = req.parentId;
    const sessionStudent = await getSessionStudentService({_id: sessionStudentId});
    if(!sessionStudent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, 'Session Student not found for this parent'));
    }
    
    const filter = {
      sessionStudent: convertToMongoId(sessionStudentId),
      startDate:{$gte: startDate},
      endDate:{$lte: endDate}
    }

    const pipeline = [
      {
        $match: filter
      }
    ];

    const leaveRequests = await getStudentLeaveRequestsPipelineService(pipeline);
    return res.status(StatusCodes.OK).send(success(200, leaveRequests));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function deleteStudentLeaveRequestByParentController(req, res) {
  try {
    const requestId = req.params.requestId;
    const parentId = req.parentId;

    const request = await getStudentLeaveRequestService({_id: requestId, parent: parentId});
    if(!request) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Request not found"));
    }
    deleteStudentLeaveRequestsService({_id: requestId});
    return res.status(StatusCodes.OK).send(success(200, "Request deleted successfully!"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateStudentLeaveRequestController(req, res) {
  try {
    const requestId = req.params.requestId;
    const { reason, description, startDate, endDate, remark, isRead } = req.body;
    const parentId = req.parentId;
    const fieldsToBeUpdated = {};
    if(reason) fieldsToBeUpdated.reason = reason;
    if(description) fieldsToBeUpdated.description = description;
    if(startDate) fieldsToBeUpdated.startDate = startDate;
    if(endDate) fieldsToBeUpdated.endDate = endDate;
    if(remark) fieldsToBeUpdated.remark = remark;
    if(isRead) fieldsToBeUpdated.isRead = isRead;

    const request = await getStudentLeaveRequestService({_id: requestId, parent: parentId});
    if(!request) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Request not found"));
    }
    updateStudentLeaveRequestService({_id: requestId}, fieldsToBeUpdated);
    return res.status(StatusCodes.OK).send(success(200, "Request updated successfully!"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateStudentLeaveRequestByTeacherController(req, res) {
  try {
    const requestId = req.params.requestId;
    const { reason, description, startDate, endDate, remark, isRead } = req.body;
    const teacherId = req.teacherId;
    const fieldsToBeUpdated = {};
    if(reason) fieldsToBeUpdated.reason = reason;
    if(description) fieldsToBeUpdated.description = description;
    if(startDate) fieldsToBeUpdated.startDate = startDate;
    if(endDate) fieldsToBeUpdated.endDate = endDate;
    if(remark) fieldsToBeUpdated.remark = remark;
    if(isRead) fieldsToBeUpdated.isRead = isRead;

    const request = await getStudentLeaveRequestService({_id: requestId});
    if(!request) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Request not found"));
    }
    updateStudentLeaveRequestService({_id: requestId}, fieldsToBeUpdated);
    return res.status(StatusCodes.OK).send(success(200, "Request updated successfully!"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}