import { error } from "../../utills/responseWrapper.js";
import { StatusCodes } from "http-status-codes";
import { attendancesStatusSchema } from "../../validators/dashboardTeacherSchema.validator.js";

export async function attendancesStatusValidation(req, res, next) {
  try {
    const { error: schemaError } = attendancesStatusSchema.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}