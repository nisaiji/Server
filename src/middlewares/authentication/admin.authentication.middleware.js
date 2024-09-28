import { error } from "../../utills/responseWrapper.js";
import Jwt from "jsonwebtoken";
import { config } from "../../config/config.js";
import { getAdminService } from "../../services/admin.services.js";

export async function adminAuthenticate(req, res, next) {
  try {
    const token = req.header("Authorization");
    if (!token){
      return res.send(error(404, "Authorization token is required"));
    }
    const parsedToken = token.split(" ")[1];
    const decoded = Jwt.verify(parsedToken, config.accessTokenSecretKey);
    const _id = decoded.adminId;
    const admin = await getAdminService({_id, isActive:true});
    if (!admin){
      return res.send(error(404, "Admin not exists"));
    }
    req.adminId = _id;
    req.role = "admin";
    next();
  } catch (err) {
    res.send(error(500, err.message));
  }
}
