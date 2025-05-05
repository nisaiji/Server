import { error } from "../../../utills/responseWrapper.js";
import { adminDetailsValidator, adminEmailOtpValidator, adminEmailValidator, adminPasswordUpdateValidator, adminPhoneAndOtpValidator, adminPhoneValidator } from "../../../validators/v2/adminSchema.validator.js";
import { StatusCodes } from "http-status-codes";

export async function adminPhoneValidation(req, res, next) {
  try {
    const { error: schemaError } = adminPhoneValidator.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function adminPhoneAndOtpValidation(req, res, next) {
  try {
    const { error: schemaError } = adminPhoneAndOtpValidator.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function adminPasswordUpdateValidation(req, res, next) {
  try {
    const { error: schemaError } = adminPasswordUpdateValidator.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function adminEmailValidation(req, res, next) {
  try {
    const { error: schemaError } = adminEmailValidator.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function adminEmailOtpValidation(req, res, next) {
  try {
    const { error: schemaError } = adminEmailOtpValidator.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function adminDetailsValidation(req, res, next) {
  try {
    const { error: schemaError } = adminDetailsValidator.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}
