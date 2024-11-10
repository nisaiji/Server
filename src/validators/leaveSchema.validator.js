import Joi from "joi";

const registerLeaveSchema = Joi.object({
  reason: Joi.string().required().messages({
    'any.required': 'Reason is required.',
  }),

  description: Joi.string().required().messages({
    'any.required': 'Description is required.'
  }),

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


// sender: Joi.object({
//   id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
//     "string.pattern.base": "Invalid sender Id.", 
//     "any.required": "sender id is required."
//   }),
//   model: Joi.string().valid('parent','teacher').required().messages({
//     'any.required': 'Model is required.',
//     'string.valid': 'Model can be parent, teacher.'
//   })
// }).required().messages({
//   'any.required': 'Sender information is required.'
// }),

// receiver: Joi.object({
//   id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
//     "string.pattern.base": "Invalid receiver Id.", 
//     "any.required": "Receiver id is required."
//   }),
//   model: Joi.string().valid('teacher','admin').required().messages({
//     'any.required': 'Model is required.',
//     'string.valid': 'Model can be admin, teacher.'
//   })
// }).required().messages({
//   'any.required': 'Sender information is required.'
// }),


export { registerLeaveSchema }