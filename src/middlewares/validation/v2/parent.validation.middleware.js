import { StatusCodes } from "http-status-codes";
import { error } from "../../../utills/responseWrapper.js";
import { parentSignupValidator } from "../../../validators/v2/parentSchema.validator.js";

export async function signupParentValidation(req, res, next) {
  try {
    const { error: schemaError } = parentSignupValidator.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}