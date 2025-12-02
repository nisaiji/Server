import { StatusCodes } from "http-status-codes"
import { error } from "../utills/responseWrapper"
import { get } from "mongoose";
import { getSessionService } from "../services/session.services";

export async function createFeeStructureController(req, res) {
  try {
    const {name, description, sectionId, classId, sessionId, feeComponents, totalAmount, dueDate, isActive} = req.body;
    const session = await getSessionService({_id: sessionId});
    if(!session || session['status']==='completed') {
      return res.status(StatusCodes.BAD_REQUEST).send(error(404, "Session completed!")); 
    }
    const feeStructure = await 

    
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}


