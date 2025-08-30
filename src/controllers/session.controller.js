import { StatusCodes } from "http-status-codes";
import { getSessionService, getSessionsPipelineService, registerSessionService, updateSessionService, updateSessionsService } from "../services/session.services.js";
import { success } from "../utills/responseWrapper.js";
import { convertToMongoId } from "../services/mongoose.services.js";

export async function createSessionController(req, res) {
  try {
    const { academicStartYear, academicEndYear } = req.body;
    const adminId = req.adminId;
    const march31UTC = new Date(Date.UTC(academicStartYear + 1, 2, 31, 0, 0, 0));
    const april1UTC = new Date(Date.UTC(academicStartYear, 3, 1, 0, 0, 0));
    if(april1UTC <= new Date() ) {
      await updateSessionsService({ school: convertToMongoId(adminId), status: "active" }, { isCurrent: false, status: 'completed' });
    }

    const sessionData = {
      startDate: april1UTC,
      endDate: march31UTC,
      academicStartYear,
      academicEndYear,
      school: adminId,
      status: (april1UTC <= new Date()) ? "active" : "upcoming"
    };

    const session = await getSessionService({school: adminId, academicStartYear, academicEndYear});
    if(session) {
    return res.status(StatusCodes.BAD_REQUEST).send(success(400, "Session already created"));
    }
    const newSession = await registerSessionService(sessionData);
    return res.status(StatusCodes.OK).send(success(200, "Session created successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err.message);
  }
};

export async function getAllSessionsOfSchoolController(req, res) {
  try {
    const adminId  = req.adminId;
    console.log({adminId})
    const pipeline = [
      {
        $match: {
          school: convertToMongoId(adminId)
        }
      }
    ]
    const sessions = await getSessionsPipelineService(pipeline);
    console.log({sessions})
    if (!sessions || sessions.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).send(success(404, "No sessions found"));
    }
    return res.status(StatusCodes.OK).send(success(200,  sessions));

  } catch (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err.message);
  }
}

export async function getSessionByIdController(req, res) {
  try {
    const { sessionId } = req.params;
    const adminId = req.adminId;
    const pipeline = [
      {
        $match: {
          _id: convertToMongoId(sessionId)
        }
      },
      {
        $lookup: {
          from: "classes",
          localField: "_id",
          foreignField: "session",
          as: "classes",

          pipeline: [
            {
              $lookup: {
                from: "sections",
                localField: "section",
                foreignField: "_id",
                as: "section"
              }
            }
          ]
        }
      },
    ];
    
    const sessions = await getSessionsPipelineService(pipeline);
    if (!sessions || sessions.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).send(success(404, "Session not found"));
    }
    const session = sessions[0];
    
    return res.status(StatusCodes.OK).send(success(200, session));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err.message);
  }
}

export async function MarkSessionAsCompletedController(req, res) {
  try {
    const { sessionId } = req.params;
    const adminId = req.adminId;

    const session = await getSessionService({ _id: sessionId, school: adminId });
    if (!session) {
      return res.status(StatusCodes.NOT_FOUND).send(success(404, "Session not found"));
    }
    if (session.status === 'completed') {
      return res.status(StatusCodes.BAD_REQUEST).send(success(400, "Session is already completed"));
    }

    await updateSessionService({ _id: sessionId }, { status: 'completed', isCurrent: false });

    return res.status(StatusCodes.OK).send(success(200, "Session marked as completed successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err.message);
  }
}