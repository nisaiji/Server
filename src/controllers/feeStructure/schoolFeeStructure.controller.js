import { StatusCodes } from "http-status-codes";
import { createSchoolFeeStructureService, getSchoolFeeStructureService } from "../../services/feeStructure/schoolFeeStructure.services.js";
import { getSessionService } from "../../services/session.services.js";
import { error, success } from "../../utills/responseWrapper.js";

export async function createSchoolFeeStructureController(req, res) {
  try {
    const { title, description, sessionId, installmentType, lateFeePercent } = req.body;
    const adminId = req.adminId;
    const session = await getSessionService({ _id: sessionId });
    if (!session || session['status'] === 'completed') {
      return res.status(StatusCodes.BAD_REQUEST).send(error(404, "Session completed!"));
    }
    let schoolFeeStructure = await getSchoolFeeStructureService({ session: sessionId, school: adminId });
    if (schoolFeeStructure) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "School Fee Structure already exists!"));
    }

    schoolFeeStructure = await createSchoolFeeStructureService({title, description, school: adminId, session: sessionId, installmentType, lateFeePercent});

    return res.status(StatusCodes.CREATED).send(success(201, { message: "Fee Structure created successfully", schoolFeeStructure }));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getSchoolFeeStructureController(req, res) {
  try {
    const {sessionId} = req.body;
    const adminId = req.adminId;

    const schoolFeeStructure = await getSchoolFeeStructureService({school: adminId, session: sessionId});
    if(!schoolFeeStructure){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "School fee structure not found"));
    }
    return res.status(StatusCodes.OK).send(success(200, schoolFeeStructure));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
} 