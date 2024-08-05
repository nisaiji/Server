import { findAdminByID } from "../../services/admin.services.js";
import { findParentById } from "../../services/parent.services.js";
import { findClassTeacherById } from "../../services/teacher.services.js";
import { error } from "../../utills/responseWrapper.js";

export async function parentForgetPasswordMiddleware(req,res,next){
  try {
    const {eventType,title,description} = req.body;
    const parentId = req.parentId;
    const adminId = req.adminId;

    if(!parentId || !adminId){
      return res.send(error(400,"Sender and Receiver Id is required"));
    }

    const parent = await findParentById(senderId);
    if(!parent){
      return res.send(error(400,"Parent not exists"));
    }
    const admin = await findAdminByID(receiverId);
    if(!admin){
      return res.send(error(400,"Admin not exists"));
    }

    next();        
  } catch (err) {
    return res.send(error(500,err.message));       
  }
}


export async function teacherForgetPasswordMiddleware(req,res,next){
  try {
    const {eventType,sender:{senderId,senderModel},receiver:{receiverId,receiverModel},title,description} = req.body;

    if(senderModel!=="Teacher" || receiverModel!=="Admin"){
      return res.send(error(400,"Invalid Sender or Receiver Model"));
    }

    const teacher = await findClassTeacherById(senderId);
    if(!teacher){
      return res.send(error(400,"Teacher not exists"));
    }
    const admin = await findAdminByID(receiverId);
    if(!admin){
      return res.send(error(400,"Admin not exists"));
    }

    if(teacher["admin"].toString()!==admin["_id"].toString()){
      return res.send(error(400,"Unauthorized request"));
    }
    next();        
  } catch (err) {
    return res.send(error(500,err.message));       
  }
}