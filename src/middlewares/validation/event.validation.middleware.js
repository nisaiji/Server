import { getEventsForAdminSchema, registerEventSchema } from "../../validators/eventSchema.validator.js";
import { StatusCodes } from "http-status-codes";
import { error } from "../../utills/responseWrapper.js";

export async function registerEventvalidation(req, res, next) {
  try {
    const { error: schemaError } = registerEventSchema.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getEventsForAdminValidation(req, res, next){
  try {
    const { error: schemaError } = getEventsForAdminSchema.validate(req.query);
    if(schemaError){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}