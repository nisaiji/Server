import { StatusCodes } from "http-status-codes";
import { error } from "../../utills/responseWrapper.js";
import {teacherRegisterSchema,teacherUpdateSchema,teacherUsernamePasswordUpdateSchema,teacherLoginSchema,teacherEmailPhoneUpdateSchema, teacherPhotoUpdateSchema, teacherAddressUpdateSchema} from "../../validators/teacherSchema.validator.js";


export async function registerTeacherValidation(req, res, next) {
  try {
    const { error: schemaError } = teacherRegisterSchema.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function loginTeacherValidation(req, res, next) {
  try {
    const { error: schemaError } = teacherLoginSchema.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function UsernamePasswordUpdateTeacherValidation(req, res, next) {
  try {
    const { error: schemaError } = teacherUsernamePasswordUpdateSchema.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function emailPhoneUpdateTeacherValidation(req, res, next) {
  try {
    const { error: schemaError } = teacherEmailPhoneUpdateSchema.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateTeacherValidation(req, res, next) {
  try {
    const { error: schemaError } = teacherUpdateSchema.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateAddressValidation(req, res, next) {
  try {
    const { error: schemaError } = teacherAddressUpdateSchema.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function photoUpdateTeacherValidation(req, res, next) {
  try {
    const { error: schemaError } = teacherPhotoUpdateSchema.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}
