import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import { error } from "../../utils/responseWrapper.js";
import {
  feeSummaryQuerySchema,
  initiatePaymentSchema,
  paymentIdParamSchema,
  sessionStudentIdParamSchema
} from "../../validators/paymentSchema.validator.js";

/**
 * Creates a validation middleware for a given Joi schema to validate the request body.
 * @param {Joi.Schema} schema - The Joi schema to validate against.
 * @returns {import("express").RequestHandler}
 */
const validateBody = (schema) => (req, res, next) => {
  const { error: validationError } = schema.validate(req.body, {
    abortEarly: false, // Report all errors
    stripUnknown: true // Remove unknown properties
  });

  if (validationError) {
    const errorMessage = validationError.details
      .map((detail) => detail.message)
      .join(", ");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send(error(StatusCodes.BAD_REQUEST, errorMessage));
  }

  next();
};

/**
 * Creates a validation middleware for a given Joi schema to validate URL parameters.
 * @param {Joi.Schema} schema - The Joi schema to validate against.
 * @returns {import("express").RequestHandler}
 */
const validateParams = (schema) => (req, res, next) => {
  const { error: validationError } = schema.validate(req.params, {
    abortEarly: false
  });

  if (validationError) {
    const errorMessage = validationError.details
      .map((detail) => detail.message)
      .join(", ");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send(error(StatusCodes.BAD_REQUEST, errorMessage));
  }

  next();
};

/**
 * Creates a validation middleware for a given Joi schema to validate query parameters.
 * @param {Joi.Schema} schema - The Joi schema to validate against.
 * @returns {import("express").RequestHandler}
 */
const validateQuery = (schema) => (req, res, next) => {
  const { error: validationError } = schema.validate(req.query, {
    abortEarly: false
  });

  if (validationError) {
    const errorMessage = validationError.details
      .map((detail) => detail.message)
      .join(", ");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send(error(StatusCodes.BAD_REQUEST, errorMessage));
  }

  next();
};

export const initiatePaymentValidation = validateBody(initiatePaymentSchema);
export const paymentIdParamValidation = validateParams(paymentIdParamSchema);
export const sessionStudentIdParamValidation = validateParams(
  sessionStudentIdParamSchema
);
export const feeSummaryQueryValidation = validateQuery(feeSummaryQuerySchema);
