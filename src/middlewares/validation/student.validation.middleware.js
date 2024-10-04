import { StatusCodes } from "http-status-codes";
import { error } from "../../utills/responseWrapper.js";
import {deleteStudentSchema, getStudentsSchema, registerStudentSchema, updateStudentByAdminSchema,updateStudentByParentSchema,updateStudentByTeacherSchema, updateStudentParentByAdminSchema, uploadStudentPhotoSchema} from "../../validators/studentSchema.validator.js";


export async function registerStudentValidation(req, res, next) {
  try {
    const { error: schemaError } = registerStudentSchema.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function deleteStudentValidation(req, res, next) {
  try {
      const { error: schemaError } = deleteStudentSchema.validate(req.params);
      if (schemaError) {
        return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
      }
      next();
    } catch (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    }
}

export async function getStudentValidation(req, res, next) {
  try {
    const { error: schemaError } = getStudentsSchema.validate(req.query);
      if (schemaError) {
        return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
      }
      next();
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message)); 
  }
}

export async function updateStudentByTeacherValidation(req, res, next) {
  try {
    const { error: schemaError } = updateStudentByTeacherSchema.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateStudentByAdminValidation(req, res, next) {
  try {
    const { error: schemaError } = updateStudentByAdminSchema.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateStudentByParentValidation(req,res,next){
  try {
    const { error: schemaError } = updateStudentByParentSchema.validate(req.body);
    if (schemaError){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next(); 
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500,err.message));
  }
}

export async function updateStudentParentByAdminValidation(req,res,next){
  try {
    const { error: schemaError } = updateStudentParentByAdminSchema.validate(req.body);
    if (schemaError){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500,err.message));
  }
}

export async function uploadStudentPhotoValidation(req,res,next){
  try {
    const { error: schemaError } = uploadStudentPhotoSchema.validate(req.body);
    if (schemaError){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500,err.message));
  }
}