import { StatusCodes } from "http-status-codes";
import { getSessionService, getSessionsPipelineService, registerSessionService } from "../services/session.services.js";
import { success } from "../utills/responseWrapper.js";
import { convertToMongoId } from "../services/mongoose.services.js";

export async function createSessionController(req, res) {
  try {
    const { name, startDate, endDate, academicStartYear, academicEndYear } = req.body;
    const adminId = req.adminId;
    
    const sessionData = {
      name,
      startDate,
      endDate,
      academicStartYear,
      academicEndYear,
      school: adminId,
      status: "upcoming"
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
