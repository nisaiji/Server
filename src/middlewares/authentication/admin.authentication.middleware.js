import { error } from "../../utills/responseWrapper.js";
import Jwt from "jsonwebtoken";
import { config } from "../../config/config.js";
import { findAdminByID } from "../../services/admin.services.js";

export async function adminAuthentication(req, res, next) {
  try {
    const token = req.header("Authorization");
    // console.log(token)
    if (!token) {
      return res.send(error(404, "Authorization token is required!"));
    }
    const parsedToken = token.split(" ")[1];
    const decoded = Jwt.verify(parsedToken, config.accessTokenSecretKey);
    const admin = await findAdminByID(decoded.adminId);
    if (!admin) {
      return res.send(error(404, "admin doesn't exists"));
    }
    req.adminId = decoded.adminId;
    next();
  } catch (err) {
    res.send(error(500, err.message));
  }
}
