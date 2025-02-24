import { StatusCodes } from "http-status-codes";
import { error } from "../../utills/responseWrapper.js";
import { getLeaveRequestsForAdminSchema, registerLeaveSchema, updateLeaveRequestSchema, updateTeacherLeaveSchema } from "../../validators/leaveSchema.validator.js";

export async function registerLeaveRequestValidation(req, res, next) {
  try {
    const { error: schemaError } = registerLeaveSchema.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getLeaveRequestsForAdminValidation(req, res, next) {
  try {
    const { error: schemaError } = getLeaveRequestsForAdminSchema.validate(req.query);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateTeacherLeaveRequestByAdminValidation(req, res, next) {
  try {
    const { error: schemaError } = updateTeacherLeaveSchema.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateTeacherLeaveRequestValidation(req, res, next) {
  try {
    const { error: schemaError } = updateLeaveRequestSchema.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}