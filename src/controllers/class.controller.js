import { StatusCodes } from "http-status-codes";
import { deleteClassService, getClassService, registerClassService, customGetClassWithSectionTeacherService, getClassesPipelineService,} from "../services/class.sevices.js";
import { error, success } from "../utills/responseWrapper.js";
import { getSessionService } from "../services/session.services.js";
import { convertToMongoId } from "../services/mongoose.services.js";

export async function registerClassController(req, res) {
  try {
    const { name, sessionId } = req.body;
    const admin = req.adminId;
    const classInfo = await getClassService({ name, admin: convertToMongoId(admin), session: convertToMongoId(sessionId) });
    const session = await getSessionService({_id: sessionId});
    if(!session) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session not found"));
    }
    if (session['status'] === 'completed') {
      return res.status(StatusCodes.BAD_REQUEST).send(error(404, "Session completed! can't register class"));
    }
    if (classInfo) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Class already exists"));
    }

    await registerClassService({ name, admin, session: sessionId });
    return res.status(StatusCodes.OK).send(success(200, "Class registered successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function deleteClassController(req, res) {
  try {
    const classId = req.params.classId;
    const admin = req.adminId;
    const classInfo = await getClassService({_id:classId});
    const session = await getSessionService({ _id: classInfo["session"] });
    if (!session || session['status'] === 'completed') {
      return res.status(StatusCodes.BAD_REQUEST).send(error(404, "Session completed! can't delete class"));
    }
    if (!classInfo) {
      return res.status(StatusCodes.NOT_FOUND).send(error(400, "Class doesn't exists"));
    }

    if (classInfo["section"].length > 0) {
      return res.status(StatusCodes.NOT_ACCEPTABLE).send(error(406, "Class has sections."));
    }
    await deleteClassService({_id:classId});
    return res.status(StatusCodes.OK).send(success(200, "Class deleted successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getClassController(req, res){
  try {
    const id = req.params.classId;
    const classInfo = await customGetClassWithSectionTeacherService({_id:id});
    return res.status(StatusCodes.OK).send(success(200, {"class":classInfo}));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message))    
  }
}

export async function getClassListController(req, res) {
  try {
    const sessionId = req.params.sessionId;
    const admin = req.adminId;
    console.log({ _id: sessionId, school: admin });
    const session = await getSessionService({ _id: sessionId, school: admin});
    if(!session) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session not found"));
    }

    const pipeline = [
      {
        $match: {
          session: convertToMongoId(sessionId),
          admin: convertToMongoId(admin)
        }
      },
      {
        $lookup: {
          from: "sections",
          localField: "_id",
          foreignField: "classId",
          as: "section"
        }
      }
    ];
    const classes = await getClassesPipelineService(pipeline);
    return res.status(StatusCodes.OK).send(success(200, classes));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}
