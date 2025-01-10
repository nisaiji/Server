import { error } from "../../utills/responseWrapper.js";
import Jwt, { decode } from "jsonwebtoken";
import { config } from "../../config/config.js";
import { getParentService } from "../../services/parent.services.js";
import { StatusCodes } from "http-status-codes";
import { getAdminService } from "../../services/admin.services.js";

export async function parentAuthenticate(req, res, next) {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.send(error(404, "Authorization token is required"));
    }
    const parsedToken = token.split(" ")[1];
    const decoded = Jwt.verify(parsedToken, config.accessTokenSecretKey);
    // if(decoded['role']!=='parent'){
    //   return res.send(error(409,"Invalid parent token"))
    // }
    const _id = decoded.parentId;
    const parent = await getParentService({_id});
    if (!parent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Parent doesn't exists"));
    }
    // const adminId = decoded.adminId;
    // const admin = await getAdminService({_id:adminId});
    // if (!admin){
    //   return res.status(StatusCodes.NOT_FOUND).send(error(404, "Admin not exists"));
    // }
    // if(admin && !admin['isActive']){
    //   return res.status(StatusCodes.FORBIDDEN).send(error(403, "Temporarily services are paused"))
    // }
    req.parentId = decoded.parentId;
    // req.adminId = decoded.adminId;
    req.role = "parent";
    next();
  } catch (err) {
    return res.send(error(500, err.message));
  }
}
