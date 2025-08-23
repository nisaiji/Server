import Joi from "joi";

const createHolidaySchema = Joi.object({
  date: Joi.date().required().messages({
    "any.required":"Date is required!"
  }),
  title: Joi.string().required().messages({
    "any.required":"Title is required!"
  }),
  description: Joi.string().allow('').optional()
});

const createHolidaysSchema = Joi.object({
  startTime: Joi.number().integer().min(0).required().messages({
    'number.base': 'Start time must be a number',
    'number.integer': 'Start time must be an integer',
    'number.min': 'Start time must be a positive number',
    'any.required': 'Start time is required'
  }),

  endTime: Joi.number().integer().min(0).required().messages({
    'number.base': 'End time must be a number',
    'number.integer': 'End time must be an integer',
    'number.min': 'End time must be a positive number',
    'any.required': 'End time is required'
  }),
  title: Joi.string().required().messages({
    "any.required":"Title is required!"
  }),
  description: Joi.string().allow('').optional(),
  sessionId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
      "string.pattern.base": "Invalid Session ID.",
      "any.required": "Session ID is required."
    }),
  sectionId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional().messages({
      "string.pattern.base": "Invalid section ID.",
      "any.required": "Section ID is required."
    }),
});

const getHolidaySchema = Joi.object({
  startTime: Joi.number().integer().min(0).required().messages({
    'number.base': 'Start time must be a number',
    'number.integer': 'Start time must be an integer',
    'number.min': 'Start time must be a positive number',
    'any.required': 'Start time is required'
  }),

  endTime: Joi.number().integer().min(0).required().messages({
    'number.base': 'End time must be a number',
    'number.integer': 'End time must be an integer',
    'number.min': 'End time must be a positive number',
    'any.required': 'End time is required'
  }),
});
 
const updateHolidaySchema = Joi.object({
  title: Joi.string().required().messages({
    "any.required":"Title is required!"
  }),
  description: Joi.string().allow('').optional(),
});

export { createHolidaySchema, createHolidaysSchema, getHolidaySchema, updateHolidaySchema };
