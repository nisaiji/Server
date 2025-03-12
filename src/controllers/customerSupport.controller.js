import { StatusCodes } from "http-status-codes";
import { registerCustomerSupportQueryService } from "../services/customerSupport.services.js";

export async function createCustomerSupportQueryController(req, res){
  try {
    const {firstname , lastname, schoolName,state, city, teacherCount, source, email, phone, message } = req.body;    
    await registerCustomerSupportQueryService({firstname , lastname, schoolName,state, city, teacherCount, source, email, phone, message})
    return res.status(StatusCodes.OK).send({status: "success", statusCode:200, msg: "Your Query save successfully"})
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({status:"error", statusCode:500, msg:error.message})    
  }
} 