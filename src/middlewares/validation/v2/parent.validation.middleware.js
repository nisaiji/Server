import { StatusCodes } from "http-status-codes";
import { error } from "../../../utills/responseWrapper.js";
import { parentEmailValidator, parentFullnameValidator, parentPasswordEditValidator, parentPasswordValidator, parentPhoneAndOtpValidator, parentPhoneValidator, parentUpdateValidator, uploadParentPhotoValidator } from "../../../validators/v2/parentSchema.validator.js";

export async function parentPhoneValidation(req, res, next) {
  try {
    const { error: schemaError } = parentPhoneValidator.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function parentEmailValidation(req, res, next) {
  try {
    const { error: schemaError } = parentEmailValidator.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function parentPasswordValidation(req, res, next) {
  try {
    const { error: schemaError } = parentPasswordValidator.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function parentPasswordEditValidation(req, res, next) {
  try {
    const { error: schemaError } = parentPasswordEditValidator.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function parentFullnameValidation(req, res, next) {
  try {
    const { error: schemaError } = parentFullnameValidator.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function parentPhoneAndOtpValidation(req, res, next) {
  try {
    const { error: schemaError } = parentPhoneAndOtpValidator.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function parentUpdateValidation(req, res, next) {
  try {
    const { error: schemaError } = parentUpdateValidator.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function parentPhotoUploadValidation(req, res, next) {
  try {
    const { error: schemaError } = uploadParentPhotoValidator.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}
