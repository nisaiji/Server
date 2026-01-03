import Joi from "joi";

export const classWiseSummarySchema = Joi.object({
  sessionID: Joi.string()
    .regex(/^[a-f\d]{24}$/i)
    .required()
    .messages({
      "string.base": "SessionID must be a valid string.",
      "string.pattern.base": "SessionID must be a valid  id.",
    }),
});

export const paymentModeReportSchema = Joi.object({
  sessionID: Joi.string()
    .regex(/^[a-f\d]{24}$/i)
    .required()
    .messages({
      "string.base": "SessionID must be a valid string.",
      "string.pattern.base": "SessionID must be a valid  id.",
    }),
  classID: Joi.string()
    .regex(/^[a-f\d]{24}$/i)
    .required()
    .messages({
      "string.base": "ClassID must be a valid string.",
      "string.pattern.base": "ClassID must be a valid  id.",
    }),
});

export const installmentReminderSchema = Joi.object({
  instanceID: Joi.string()
    .regex(/^[a-f\d]{24}$/i)
    .required()
    .messages({
      "string.base": "Instance ID must be a valid string.",
      "string.pattern.base": "Instance ID must be a valid  id.",
    }),
});
