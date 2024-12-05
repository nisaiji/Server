import { error } from "../../utills/responseWrapper.js";
import { StatusCodes } from "http-status-codes"

export function authorizeTeacherRoles(...allowedRoles){
  return (req, res, next)=>{
    if(!allowedRoles.includes(req.role)){
      return res.status(StatusCodes.UNAUTHORIZED).send(error(401, "Unathorized access"))
    }
    next();
  }
}