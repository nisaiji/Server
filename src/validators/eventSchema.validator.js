import Joi from "joi";

const registerEventSchema = Joi.object({
  type: Joi.string().valid('forgetPassword').required().messages({
    'any.required': 'Type is required.',
    'string.valid': 'Type must be forgetPassword.'
  }),

  sender: Joi.object({
    id: Joi.string().required().messages({
      'any.required': 'Id is required.'
    }),
    model: Joi.string().valid('parent','teacher', 'admin').required().messages({
      'any.required': 'Model is required.',
      'string.valid': 'Model can be parent, teacher'
    })
  }).required().messages({
    'any.required': 'Sender information is required.'
  }),

  receiver: Joi.object({
    id: Joi.string().required().messages({
      'any.required': 'Id is required.'
    }),
    model: Joi.string().valid('parent','teacher', 'admin').required().messages({
      'any.required': 'Model is required',
      'string.valid': 'Model can be parent, teacher, admin'
    })
  }).required().messages({
    'any.required': 'Receiver is required.'
  }),
  title: Joi.string().optional(),
  description: Joi.string().optional(),
});

const getEventsForAdminSchema = Joi.object({
  model: Joi.string().required().messages({
      'any.required': 'Model is required.',
      'string.base': 'Model must be a string.'
  }),
  type: Joi.string().required().messages({
      'any.required': 'Type is required.',
      'string.base': 'Type must be a string.'
  }),
  status: Joi.string().required().messages({
      'any.required': 'Type is required.',
      'string.base': 'Type must be a string.'
  }),
  include: Joi.string().optional(),
  startTime: Joi.number().required().messages({
      'any.required': 'Start time is required.',
  }),
  endTime: Joi.number().required().messages({
      'any.required': 'End time is required.',
  }),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).default(10) 
});

export { registerEventSchema, getEventsForAdminSchema }