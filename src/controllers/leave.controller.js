import { getLeaveRequestsCountService, getLeaveRequestService, getLeaveRequestsPipelineService, registerLeaveRequestService, updateLeaveRequestService } from "../services/leave.service.js";
import { convertToMongoId } from "../services/mongoose.services.js";
import { error, success } from "../utills/responseWrapper.js";
import { StatusCodes } from "http-status-codes";
import { getGuestTeacherService, registerGuestTeacherService } from "../services/guestTeacher.service.js";
import { hashPasswordService } from "../services/password.service.js";
import { getSectionService, updateSectionService } from "../services/section.services.js";
import { getTeacherService, updateTeacherService } from "../services/teacher.services.js";
import { getFormattedDateService } from "../services/celender.service.js";

export async function registerLeaveRequestController(req, res){
  try {
    const { reason, description, startTime, endTime } = req.body;
    const senderId = req.teacherId;
    const receiverId = req.adminId;

    if(startTime > endTime){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, 'Start Time must be less than End Time'))
    }

    const pipeline = [
      {
        $match: {
          'sender.id': convertToMongoId(senderId),
          status: {$in: ['pending', 'accept']},
          startTime: {$lte: endTime},
          endTime: {$gte: startTime}
        }
      }
    ];

  const leaveRequests = await getLeaveRequestsPipelineService(pipeline);
  if(leaveRequests.length > 0){
    const startDate = getFormattedDateService(new Date(leaveRequests[0].startTime));
    const endDate = getFormattedDateService(new Date(leaveRequests[0].endTime));
    const leaveStatus = leaveRequests[0].status==='accept'?'issued':'applied';
    return res.status(StatusCodes.CONFLICT).send(error(409, `Leave already ${leaveStatus} from ${startDate} to ${endDate}.`))
  }

  const leaveRequestObj = {
    reason,
    description,
    sender: {
      id: senderId,
      model: "teacher"
    },
    receiver: {
      id: receiverId,
      model: "admin"
    },
    startTime,
    endTime
  }
  await registerLeaveRequestService(leaveRequestObj);
  return res.status(StatusCodes.OK).send(success(200, "Request sent successfully"));

  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getLeaveRequestsController(req, res){
  try {
    const { senderId, model, status, page=1, limit =10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum-1)*limitNum;

    const filter = {
      receiver: {id: convertToMongoId(req.adminId), model: "admin"}
    }

    if(senderId){
      filter["sender.id"] = convertToMongoId(senderId);
    }

    if(model){
      const modelsArray = model.split(",").map(modelVal=>modelVal.trim());
      filter["sender.model"] = { $in: modelsArray };
    }

    if(status){
      const statusArray = status.split(",").map(statusVal=>statusVal.trim());
      filter["status"] = { $in: statusArray };
    }

    const pipeline = [
      {
         $match: filter
      },
      {
        $facet: {
          teachers: [
            {
              $match: {
                'sender.model': 'teacher'
              }
            },
            {
              $lookup: {
                from: 'teachers',
                localField: 'sender.id',
                foreignField: '_id',
                as: 'teacher'
              }
            },
            {
              $unwind: {
                path: '$teacher', 
                preserveNullAndEmptyArrays: true
               }
            },
            {
              $lookup: {
                from: 'sections',
                localField: 'teacher.section',
                foreignField: '_id',
                as: 'section',
                pipeline: [
                  { $project: { name: 1, classId: 1 } }
                ]
              }
            },
            {
              $unwind: {
                path: '$section',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: 'classes',
                localField: 'section.classId',
                foreignField: '_id',
                as: 'class',
                pipeline: [
                  { $project: { name: 1 } }
                ]
              }
            },
            {
              $unwind: {
                path: '$class',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: 'guestteachers',
                localField: '_id',
                foreignField: 'leaveRequest',
                as: 'guestTeacher'
              }
            },
            {
              $unwind: {
                path: '$guestTeacher',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 1,
                reason: 1,
                description: 1,
                status: 1,
                startTime: 1,
                endTime: 1,
                createdAt: 1,
                teacher: {
                  _id: "$teacher._id",
                  firstname: "$teacher.firstname",
                  lastname: "$teacher.lastname",
                  section: "$section.name",
                  class: "$class.name",
                  leaveRequestCount: "$teacher.leaveRequestCount"
                },
                guestTeacher: {
                  _id: '$guestTeacher._id',
                  username: '$guestTeacher.username',
                  tagline: '$guestTeacher.tagline',
                  secretKey: '$guestTeacher.secretKey'
                }
              }
            },
            {
               $sort: { 
                createdAt: -1
              } 
            },
            {
               $skip: skipNum 
            },
            {
               $limit: limitNum
            },
          ],

          students: [
            {
              $match: {
                'sender.model': 'student'
              },
            },
            {
              $lookup: {
                from: 'students',
                localField: 'sender.id',
                foreignField: '_id',
                as: 'student'
              }
            },
            {
              $unwind: {
                path: '$student',
                preserveNullAndEmptyArrays: true
              }
            }
          ]
        }
      },
    ];

    const leaveRequests = await getLeaveRequestsPipelineService(pipeline);
    const totalLeaveRequests = await getLeaveRequestsCountService(filter);
    const totalPages = Math.ceil(totalLeaveRequests / limitNum)

    return res.status(StatusCodes.OK).send(success(200, {
      leaveRequests,
      currentPage: pageNum,
      totalPages,
      totalLeaveRequests,
      pageSize: limitNum
    }));

  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateTeacherLeavRequestByAdminController(req, res){
  try {
    const { leaveRequestId, status, username, password, tagline }  = req.body;
    const adminId = req.adminId;
    const leaveRequest = await getLeaveRequestService({_id: leaveRequestId, status: 'pending' })
    if(!leaveRequest){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Leave Request not found"));
    }
    const section = await getSectionService({teacher: leaveRequest.sender.id})
    if(!section){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Section not found"));
    }
    if(status==='accept'){
      const hashedPassword = await hashPasswordService(password)
      const [existingTeacher, existingGuestTeacher] = await Promise.all([
        getTeacherService({ username, isActive: true }),
        getGuestTeacherService({ username, isActive: true })      
      ])
      if(existingTeacher || existingGuestTeacher){
        return res.status(StatusCodes.CONFLICT).send(success(409, "Username already exists"));
      }
      const teacher = await getTeacherService({_id: leaveRequest.sender.id})
      const guestTeacherObj = { username, password: hashedPassword, secretKey: password, tagline, startTime: leaveRequest['startTime'], endTime: leaveRequest["endTime"], leaveRequest: leaveRequestId, admin: adminId, section: section["_id"]}
      const guestTeacher = await registerGuestTeacherService(guestTeacherObj);
      await updateTeacherService({_id: teacher['_id']}, {leaveRequestCount: teacher['leaveRequestCount']+1 })
    }
    
    await updateLeaveRequestService({_id: leaveRequestId}, {status})
    const successMessage = status === 'accept' ? "Leave Request Accepted Successfully" : "Leave Request Rejected Successfully";
    return res.status(StatusCodes.OK).send(success(200, successMessage))
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500,err.message));
  }
}

export async function updateTeacherLeavRequestController(req ,res) {
  try {
    const { leaveRequestId, reason, description, startTime, endTime }  = req.body;
    const teacherId = req.teacherId;
    if(startTime > endTime){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, 'Start time must be less than end time'))
    }
    const leaveRequest = await getLeaveRequestService({_id: leaveRequestId })
    if(!leaveRequest){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Leave Request not found"));
    }
    if(leaveRequest['status'] !=='pending') {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Can't update leave request now"));
    }
    const pipeline = [
      {
        $match: {
          'sender.id': convertToMongoId(teacherId),
          status: 'pending',
          startTime: {$lte: endTime},
          endTime: {$gte: startTime},
          _id: {$ne: convertToMongoId(leaveRequestId)}
        }
      }
    ];

    const leaveRequests = await getLeaveRequestsPipelineService(pipeline);
    if(leaveRequests.length > 0){
      const startDate = getFormattedDateService(new Date(leaveRequests[0].startTime));
      const endDate = getFormattedDateService(new Date(leaveRequests[0].endTime))
      return res.status(StatusCodes.CONFLICT).send(error(409, `Leave already applied from ${startDate} to ${endDate}`))
    }

    await updateLeaveRequestService({ _id: leaveRequestId }, {reason, description, startTime, endTime});
    return res.status(StatusCodes.OK).send(success(200, "Leave Request updated successfully"));
    
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500,err.message));
  }
}
