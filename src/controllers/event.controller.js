import {parentForgetPasswordEventRegisterService } from "../services/event.services.js";
import { error, success } from "../utills/responseWrapper.js";

export async function parentForgetPasswordController(req,res){
  try {
    const { eventType,title, description } = req.body;
    const parentId = req.parentId;
    const adminId = req.adminId;
    const event = await parentForgetPasswordEventRegisterService({eventType,sender:{id:parentId,model:"Parent"},receiver:{id:adminId,model:"Admin"},title,description});
    if(event instanceof Error){
      return res.send(error(400,"Unable to create event."));
    }
    return res.send(success(200,"Forget password requested successfully"));
  } catch (err) {
    return res.send(error(500,err.message));
  }
}

export async function teacherForgetPasswordController(req,res){
  try {
    
  } catch (err) {
    return res.send(error(500,err.message));
  }
}

export async function adminAllForgetPasswordRequestsController(req,res){
  try {

  } catch (err) {
    return res.send(error(500,err.message));
  }
}