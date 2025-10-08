import { error } from "../../../utills/responseWrapper.js";
import Jwt from "jsonwebtoken";
import { config } from "../../../config/config.js";
import { StatusCodes } from "http-status-codes";
import { getParentService } from "../../../services/v2/parent.services.js";

export async function parentAuthenticate(req, res, next) {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.send(error(404, "Authorization token is required"));
    }
    const parsedToken = token.split(" ")[1];
    const decoded = Jwt.verify(parsedToken, config.accessTokenSecretKey);
    const _id = decoded.parentId;
    const parent = await getParentService({_id});
    if (!parent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "User not found"));
    }

    if (parent['isActive']===false) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Services are temporarily paused. Please contact support"));
    }

    if(parent['status']==='unVerified') {
      return res.status(StatusCodes.BAD_REQUEST).send(error(404, "User verification is pending"));
    }

    // if(parent['status']==='phoneVerified') {
    //   return res.status(StatusCodes.BAD_REQUEST).send(error(404, "User email Verification is pending"));
    // }

    req.parentId = decoded.parentId;
    req.role = "parent";
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function refreshParentTokenAuthenticate(req, res, next) {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.send(error(404, "Authorization token is required!"));
    }
    const parsedToken = token.split(" ")[1];
    const decoded = Jwt.verify(parsedToken, config.refreshTokenSecretKey);
    delete decoded.iat;
    delete decoded.exp;
    const parent = await getParentService({_id:decoded.parentId, isActive:true});
    if (!parent) {
      return res.status(StatusCodes.GONE).send(error(410, "User not found"));
    }
    // const section = await getSectionByIdService(teacher["section"])
    // if (!section) {
    //   return res.status(StatusCodes.NOT_FOUND).send(error(404, "Section not found"));
    // }
    req.parentId = decoded.parentId;
    // req.sectionId = decoded?.sectionId;
    // req.adminId = decoded.adminId;
    req.role = decoded?.role;
    req.data = decoded;
    next();
  } catch (err) {
    res.send(error(500, err.message));
  }
}