import Joi from "joi";

const registerSectionSchema = Joi.object({
  name: Joi.string().min(1).max(5).required().messages({
    "string.min": "Name must be at least 1 char long.",
    "string.max": "Name must be max 5 chars long.",
    "any.required": "Name is required."
    }),
  startTime: Joi.number().integer().min(0).required().messages({
    'number.base': 'Start time must be a number',
    'number.integer': 'Start time must be an integer',
    'number.min': 'Start time must be a positive number',
    'any.required': 'Start time is required'
    }),
  teacherId: Joi.string().required().messages({
    "any.required": "Class teacher ID is required."
    }),
  classId: Joi.string().required().messages({
    "any.required": "Class ID is required."
    })
});

export { registerSectionSchema };
