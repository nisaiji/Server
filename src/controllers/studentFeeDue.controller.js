import { StatusCodes } from "http-status-codes";
import { isValidMongoId } from "../services/mongoose.services.js";
import { getStudentFeeDuesService } from "../services/studentFeeDue.service.js";
import { error, success } from "../utils/responseWrapper.js";

export async function getStudentFeeDuesController(req, res) {
  try {
    const { sessionId, studentId } = req.params;
    const adminId = req.adminId;

    if (!isValidMongoId(sessionId)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(error(400, "Invalid session Id"));
    }

    if (!isValidMongoId(studentId)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(error(400, "Invalid student Id"));
    }

    const dues = await getStudentFeeDuesService({
      studentId,
      sessionId,
      adminId
    });

    return res.status(StatusCodes.OK).send(success(200, { dues }));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}
