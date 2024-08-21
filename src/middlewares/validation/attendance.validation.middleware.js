import { StatusCodes } from "http-status-codes";
import { error } from "../../utills/responseWrapper.js";
import { attendanceByParentSchema, attendanceByTeacherSchema, attendanceCountSchema, attendanceStatusSchema, updateAttendanceSchema } from "../../validators/attendanceSchema.validator.js";


export async function attendanceByTeacherValidation(req,res,next){
    try {
      const{error: schemaError} = attendanceByTeacherSchema.validate(req.body);
      if(schemaError){
        return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));    
      }
      next();
    } catch (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));    
    }
  }

export async function attendanceByParentValidation(req,res,next){
    try {
      const{error: schemaError} = attendanceByParentSchema.validate(req.body);
      if(schemaError){
        return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));    
      }
      next();
    } catch (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));    
    }
  }

export async function updateAttendanceValidation(req, res, next){
  try {
    const{error: schemaError} =  updateAttendanceSchema.validate(req.body);
    if(schemaError){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));    
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));    
  }
}

export async function attendanceStatusValidation(req, res, next){
  try {
    const{error: schemaError} =  attendanceStatusSchema.validate(req.body);
    if(schemaError){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));    
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message))
  }
}

export async function attendanceCountValidation(req, res, next){
  try {
    const{error: schemaError} =  attendanceCountSchema.validate(req.body);
    if(schemaError){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));    
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message))
  }
}