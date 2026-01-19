import { StatusCodes } from "http-status-codes";
import { error } from "../../utills/responseWrapper.js";
import { classWiseSummarySchema, paymentModeReportSchema, installmentReminderSchema } from "../../validators/adminDashboardSchema.validator.js";

export async function classWiseSummaryValidation(req, res, next) {
  try {
    const { error: schemaError } = classWiseSummarySchema.validate(req.query);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}


export async function paymentModeReportValidation(req, res, next) {
  try {
    const { error: schemaError } = paymentModeReportSchema.validate(req.query);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function installmentReminderValidation(req, res, next) {
  try {
    const { error: schemaError } = installmentReminderSchema.validate(req.body);
    if (schemaError) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}