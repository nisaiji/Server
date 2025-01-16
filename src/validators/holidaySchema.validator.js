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

export { createHolidaySchema, getHolidaySchema, updateHolidaySchema };
