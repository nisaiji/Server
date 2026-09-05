import Joi from "joi";

const mongoIdSchema = Joi.string().hex().length(24);

export const initiatePaymentSchema = Joi.object({
  sessionStudentId: mongoIdSchema.required().messages({
    "any.required": "Session student Id is required.",
    "string.hex": "Session student Id must be a valid Mongo Id.",
    "string.length": "Session student Id must be a valid Mongo Id."
  }),
  feeDueIds: Joi.array().items(mongoIdSchema).min(1).required().messages({
    "any.required": "Fee due Ids are required.",
    "array.min": "At least one fee due Id is required."
  })
});

export const paymentIdParamSchema = Joi.object({
  paymentId: mongoIdSchema.required().messages({
    "any.required": "Payment Id is required.",
    "string.hex": "Payment Id must be a valid Mongo Id.",
    "string.length": "Payment Id must be a valid Mongo Id."
  })
});

export const sessionStudentIdParamSchema = Joi.object({
  sessionStudentId: mongoIdSchema.required().messages({
    "any.required": "Session student Id is required.",
    "string.hex": "Session student Id must be a valid Mongo Id.",
    "string.length": "Session student Id must be a valid Mongo Id."
  })
});

export const receiptNoParamSchema = Joi.object({
  receiptNo: Joi.string().trim().required().messages({
    "any.required": "Receipt number is required."
  })
});

export const feeSummaryQuerySchema = Joi.object({
  sessionId: mongoIdSchema.required().messages({
    "any.required": "Session Id is required.",
    "string.hex": "Session Id must be a valid Mongo Id.",
    "string.length": "Session Id must be a valid Mongo Id."
  }),
  month: Joi.number().integer().min(1).max(12).required().messages({
    "any.required": "Month is required.",
    "number.base": "Month must be a number.",
    "number.integer": "Month must be an integer.",
    "number.min": "Month must be between 1 and 12.",
    "number.max": "Month must be between 1 and 12."
  }),
  year: Joi.number().integer().min(1900).required().messages({
    "any.required": "Year is required.",
    "number.base": "Year must be a number.",
    "number.integer": "Year must be an integer.",
    "number.min": "Year must be a valid year."
  })
});
