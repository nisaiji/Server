import { error } from "../../utills/responseWrapper.js";
import Jwt, { decode } from "jsonwebtoken";
import { config } from "../../config/config.js";
import { getTeacherService } from "../../services/teacher.services.js";
import { getSectionByIdService, getSectionService } from "../../services/section.services.js";
import { StatusCodes } from "http-status-codes";
import { getGuestTeacherService } from "../../services/guestTeacher.service.js";
import { getAdminService } from "../../services/admin.services.js";

export async function teacherAuthenticate(req, res, next) {
  try { 
    const token = req.header("Authorization");
    if (!token) {
      return res.send(error(404, "Authorization token is required!"));
    }
    const parsedToken = token.split(" ")[1];
    const decoded = Jwt.verify(parsedToken, config.accessTokenSecretKey);
    console.log({decoded})
    let teacher;
    if(decoded['role']==='teacher'){
      teacher = await getTeacherService({_id:decoded.teacherId, isActive:true});
    }
    if(decoded['role']==='guestTeacher'){
      teacher = await getGuestTeacherService({_id:decoded.teacherId });
    }
    if (!teacher) {
      return res.status(StatusCodes.GONE).send(error(410, "User not found"));
    }
    const adminId = decoded.adminId;
    const admin = await getAdminService({_id:adminId});
    if (!admin){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Admin not found"));
    }
    if(admin && !admin['isActive']){
      return res.status(StatusCodes.GONE).send(error(410, "Services are temporarily paused. Please contact admin."))
    }
    const section = await getSectionService({_id : decoded?.sectionId})
    if (!section) {
      return res.status(StatusCodes.GONE).send(error(410, "Section not found"));
    }
    if (decoded['role']==='teacher' && section['teacher'].toString()!==decoded?.teacherId) {
      return res.status(StatusCodes.GONE).send(error(410, "User has been replaced"));
    }
    if (decoded['role']==='guestTeacher' && section['guestTeacher'].toString()!==decoded?.teacherId) {
      return res.status(StatusCodes.GONE).send(error(410, "User has been replaced"));
    }

    req.teacherId = decoded?.teacherId;
    req.sectionId = decoded?.sectionId;
    req.adminId = decoded.adminId;
    req.role = decoded.role;
    next();
  } catch (err) {
    res.send(error(500, err.message));
  }
}

export async function refreshTokenAuthenticate(req, res, next) {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.send(error(404, "Authorization token is required!"));
    }
    const parsedToken = token.split(" ")[1];
    const decoded = Jwt.verify(parsedToken, config.refreshTokenSecretKey);
    delete decoded.iat;
    delete decoded.exp;
    const teacher = await getTeacherService({_id:decoded.teacherId, isActive:true});
    if (!teacher) {
      return res.status(StatusCodes.GONE).send(error(410, "User not found"));
    }
    const section = await getSectionByIdService(teacher["section"])
    if (!section) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Section not found"));
    }
    req.teacherId = decoded.teacherId;
    req.sectionId = decoded?.sectionId;
    req.adminId = decoded.adminId;
    req.role = "teacher";
    req.data = decoded;
    next();

  } catch (err) {
    res.send(error(500, err.message));
  }
}