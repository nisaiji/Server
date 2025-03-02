import otpGenerator from "otp-generator";
import { getReceiver, getUser } from "../helpers/event.helper.js";
import { StatusCodes } from "http-status-codes";
import {
  getChangePasswordRequestCountService,
  getChangePasswordRequestService,
  getChangePasswordRequestsPipelineService,
  registerChangePasswordRequestService,
  updateChangePasswordRequestService
} from "../services/changePassword.services.js";
import { error, success } from "../utills/responseWrapper.js";
import { convertToMongoId } from "../services/mongoose.services.js";
import { getTeacherService, updateTeacherService } from "../services/teacher.services.js";
import { hashPasswordService } from "../services/password.service.js";

export async function registerChangePasswordRequestController(req, res) {
  try {
    const { reason, description, sender: { phone: senderPhone, model: senderModel } } = req.body;

    const sender = await getUser(senderModel, { phone: senderPhone, isActive: true });

    if (!sender) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "User not found"));
    }

    if (senderModel === "teacher" && !sender.section) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(409, "User in not authorized for forget password"));
    }
    const request = await getChangePasswordRequestService({ "sender.id": sender["_id"], status: { $in: ["pending", "accept"] } });
    if (request && request.status === "accept") {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Request approved, please change the password"));
    }
    if (request && request.status === "pending") {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Request is being processed under admin"));
    }
    const receiver = await getUser("admin", { _id: sender["admin"], isActive: true });
    if (!receiver) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Admin not found"));
    }

    const requestObj = {
      reason,
      description,
      sender: { id: sender["_id"], model: senderModel },
      receiver: { id: receiver["_id"], model: "admin" },
      expiredAt: Date.now() + 24 * 60 * 60 * 1000,
      status: "pending"
    };
    await registerChangePasswordRequestService(requestObj);
    return res.status(StatusCodes.OK).send(success(200, "Request sent successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getChangePasswordRequestsController(req, res) {
  try {
    const { model, reason, status, include, page = 1, limit = 10 } = req.query;
    const [receiverModel, receiverId] = getReceiver(req);

    if (!receiverModel || !receiverId) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(401, "User details required!"));
    }
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    const filter = {
      receiver: { id: convertToMongoId(receiverId), model: receiverModel }
    };

    if (model) {
      const modelsArray = model.split(",").map((modelVal) => modelVal.trim());
      filter["sender.model"] = { $in: modelsArray };
    }

    if (status) {
      const statusArray = status.split(",").map((statusVal) => statusVal.trim());
      filter["status"] = { $in: statusArray };
    }

    const pipeline = [
      { $match: filter },
      { $sort: { date: 1 } },
      { $skip: skipNum },
      { $limit: limitNum }
    ];

    // Lookup for teachers
    pipeline.push({
      $lookup: {
        from: "teachers",
        localField: "sender.id",
        foreignField: "_id",
        as: "teacher",
        pipeline: [
          {
            $project: { password: 0, isActive: 0, isLoginAlready: 0, admin: 0 }
          }
        ]
      }
    });

    // Unwind teacherInfo
    pipeline.push({
      $unwind: {
        path: "$teacher",
        preserveNullAndEmptyArrays: true
      }
    });

    // Lookup for sections
    pipeline.push({
      $lookup: {
        from: "sections",
        localField: "teacher.section",
        foreignField: "_id",
        as: "section",
        pipeline: [{ $project: { name: 1, classId: 1 } }]
      }
    });

    // Unwind sectionDetails
    pipeline.push({
      $unwind: {
        path: "$section",
        preserveNullAndEmptyArrays: true
      }
    });

    // Lookup for classes
    pipeline.push({
      $lookup: {
        from: "classes",
        localField: "section.classId",
        foreignField: "_id",
        as: "class",
        pipeline: [{ $project: { name: 1 } }]
      }
    });

    // Unwind classDetails
    pipeline.push({
      $unwind: {
        path: "$class",
        preserveNullAndEmptyArrays: true
      }
    });

    // Final projection
    pipeline.push({
      $project: {
        _id: 1,
        reason: 1,
        title: 1,
        status: 1,
        date: 1,
        otp: 1,
        teacher: {
          _id: "$teacher._id",
          firstname: "$teacher.firstname",
          lastname: "$teacher.lastname",
          forgetPasswordCount: "$teacher.forgetPasswordCount",
          section: "$section.name",
          class: "$class.name"
        }
      }
    });

    const requests = await getChangePasswordRequestsPipelineService(pipeline);
    const totalRequests = await getChangePasswordRequestCountService(filter);
    const totalPages = Math.ceil(totalRequests / limitNum);

    return res.status(StatusCodes.OK).send(
      success(200, {
        requests,
        currentPage: pageNum,
        totalPages,
        totalRequests,
        pageSize: limitNum
      })
    );
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateChangePasswordRequestByAdminController(req, res) {
  try {
    const { eventId, status } = req.body;
    const [receiverModel, receiverId] = getReceiver(req);
    const event = await getChangePasswordRequestService({ _id: eventId });

    if (!event) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Event not found"));
    }

    if (event.receiver.id.toString() !== receiverId.toString()) {
      return res.status(StatusCodes.UNAUTHORIZED).send(401, "Unauthorized to update event.");
    }

    const fieldsToBeUpdated = {};
    if (status === "accept") {
      fieldsToBeUpdated.otp = otpGenerator.generate(5, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false
      });
      fieldsToBeUpdated.status = status;
    } else {
      fieldsToBeUpdated.status = status;
    }
    await updateChangePasswordRequestService({ _id: eventId }, fieldsToBeUpdated);
    return res.status(StatusCodes.OK).send(success(200, "Event updated successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function verifyTeacherForgetPasswordController(req, res) {
  try {
    const { otp, phone, deviceId } = req.body;
    const teacher = await getTeacherService({ phone, isActive: true });
    if (!teacher) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "User not found"));
    }

    const request = await getChangePasswordRequestService({
      "sender.model": "teacher",
      "sender.id": teacher["_id"],
      status: "accept"
    });
    if (!request) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(401, "Please raise a password reset request first"));
    }
    if (otp !== request["otp"]) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "OTP not matched"));
    }

    if(request['reason']!=='changeDevice' && deviceId!==teacher['deviceId']){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Access denied due to device mismatch"));
    }

    if(request['reason']==='changeDevice'){
      await updateTeacherService({ _id: teacher['_id'] }, { deviceId });
    }

    return res.status(StatusCodes.OK).send(success(200, { id: teacher["id"] }));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function changePasswordByVerifiedTeacherController(req, res) {
  try {
    const { id, password, deviceId } = req.body;
    const teacher = await getTeacherService({ _id: id, isActive: true });

    if (!teacher) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Teacher not found"));
    }

    if(teacher['deviceId']!==deviceId){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Access denied due to device mismatch"));
    }
    const hashedPassword = await hashPasswordService(password);
    await updateTeacherService({ _id: id, isActive: true }, { password: hashedPassword, forgetPasswordCount: teacher.forgetPasswordCount + 1 });
    await updateChangePasswordRequestService({ "sender.id": convertToMongoId(id), status: "accept" }, { status: "complete" });
    return res.status(StatusCodes.OK).send(success(200, "Password updated successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}
