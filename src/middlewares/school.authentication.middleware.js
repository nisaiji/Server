import { error } from "../utills/responseWrapper.js";
import Jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { findSchoolByID } from "../services/school.services.js";

export async function schoolAuthentication(req, res, next) {
  try {
    // console.log("authentication called")
    const token = req.header("Authorization");
    if (!token) {
      return res.send(error(404, "Authorization token is required!"));
    }
    const parsedToken = token.split(" ")[1];
    const decoded = Jwt.verify(parsedToken, config.jwtSecret);
    const school = await findSchoolByID(decoded.schoolId);
    if (!school) {
      return res.send(error(404, "school doesn't exists"));
    }
    req.schoolId = decoded.schoolId;
    next();
  } catch (err) {
    res.send(error(500, err.message));
  }
}
