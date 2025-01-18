import { StatusCodes } from "http-status-codes";
import { error } from "../../utills/responseWrapper.js";
import {adminAddressSchema, adminDetailsSchema, loginAdminSchema, registerAdminSchema,updateAdminProfileSchema, updateAdminSocialProfileSchema} from "../../validators/adminSchema.validator.js";

export async function adminRegisterValidation(req, res, next) {
  try {
    const { error: schemaError } = registerAdminSchema.validate(req.body);
    if (schemaError){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function adminAddressValidation(req, res, next) {
  try {
    const { error: schemaError } = adminAddressSchema.validate(req.body);
    if (schemaError){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function adminDetailsValidation(req, res, next) {
  try {
    const { error: schemaError } = adminDetailsSchema.validate(req.body);
    if (schemaError){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function adminLoginValidation(req, res, next) {
  try {
    const { error: schemaError } = loginAdminSchema.validate(req.body);
    if (schemaError){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function adminProfileUpdateValidation(req, res, next) {
  try {
    const { error: schemaError } = updateAdminProfileSchema.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function adminSocialProfileUpdateValidation(req, res, next) {
  try {
    const { error: schemaError } = updateAdminSocialProfileSchema.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}
