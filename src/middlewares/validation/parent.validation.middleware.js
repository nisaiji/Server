import { StatusCodes } from "http-status-codes";
import { error } from "../../utills/responseWrapper.js";
import { parentAuthUpdateSchema, parentLoginSchema, parentProfileInfoUpdateSchema, parentProfileUpdateSchema } from "../../validators/parentSchema.validator.js";

export async function loginParentValidation(req, res, next) {
  try {
    const { error: schemaError } = parentLoginSchema.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function authUpdateParentValidation(req, res, next) {
  try {
    const { error: schemaError } = parentAuthUpdateSchema.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next()
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function profileUpdateParentValidation(req, res, next) {
  try {
    const { error: schemaError } = parentProfileUpdateSchema.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next()
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function profileInfoUpdateParentValidation(req, res, next) {
  try {
    const { error: schemaError } = parentProfileInfoUpdateSchema.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next()
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}
