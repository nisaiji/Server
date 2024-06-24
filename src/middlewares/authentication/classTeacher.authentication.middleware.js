import { error } from "../../utills/responseWrapper.js";
import Jwt from "jsonwebtoken";
import { config } from "../../config/config.js";
import { findClassTeacherById } from "../../services/teacher.services.js";

export async function classTeacherAuthentication(req, res, next) {
  try { 
    const token = req.header("Authorization");
    if (!token) {
      return res.send(error(404, "Authorization token is required!"));
    }
    const parsedToken = token.split(" ")[1];
    const decoded = Jwt.verify(parsedToken, config.accessTokenSecretKey);
    const teacher = await findClassTeacherById(decoded.teacherId);
    if (!teacher) {
      return res.send(error(404, "class teacher doesn't exists"));
    }
    req.teacherId = decoded.teacherId;
    req.sectionId = decoded?.sectionId;
    req.adminId = decoded.adminId;
    next();
  } catch (err) {
    res.send(error(500, err.message));
  }
}