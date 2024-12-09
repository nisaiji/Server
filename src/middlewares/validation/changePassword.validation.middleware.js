import { changePasswordByVerifiedTeacherSchema, getChangePasswordRequestsForAdminSchema, registerChangePasswordRequestSchema, updateChangePasswordRequestByAdminSchema, verifyTeacherChangePasswordSchema } from "../../validators/changePasswordSchema.validator.js";
import { StatusCodes } from "http-status-codes";
import { error } from "../../utills/responseWrapper.js";

export async function registerChangePasswordRequestValidation(req, res, next) {
  try {
    const { error: schemaError } = registerChangePasswordRequestSchema.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getChangePasswordRequestsForAdminValidation(req, res, next){
  try {
    const { error: schemaError } = getChangePasswordRequestsForAdminSchema.validate(req.query);
    if(schemaError){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateChangePasswordRequestByAdminValidation(req, res, next){
  try {
    const { error: schemaError } = updateChangePasswordRequestByAdminSchema.validate(req.query);
    if(schemaError){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function verfiyTeacherChangePasswordValidation(req, res, next){
  try {
    const { error: schemaError } = verifyTeacherChangePasswordSchema.validate(req.body);
    if(schemaError){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function changePasswordByVerifiedTeacherValidation(req, res, next){
  try {
    const { error: schemaError } = changePasswordByVerifiedTeacherSchema.validate(req.body);
    if(schemaError){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}