import { StatusCodes } from "http-status-codes";
import { getSessionService, registerSessionService } from "../services/session.services.js";
import { success } from "../utills/responseWrapper.js";

export async function createSessionController(req, res) {
  try {
    const { name, startDate, endDate, academicStartYear, academicEndYear } = req.body;
    const adminId = req.adminId || "68440afcf5d77f74b79d05f6";
    console.log(req.body);
    
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

