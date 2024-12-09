import Joi from "joi";

const registerLeaveSchema = Joi.object({
  reason: Joi.string().required().messages({
    'any.required': 'Reason is required'
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

const getLeaveRequestsForAdminSchema = Joi.object({
  senderId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional().messages({
    "string.pattern.base": "Invalid student ID.",
    "any.required": "Student ID is required."
  }),

  model: Joi.optional().optional().messages({
    "string.base": "Model must be a string."
  }),

  status: Joi.string().optional().messages({
    "string.base": "Status must be a string"
  }),

  page: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Page must be number',
    'number.integer': 'Page must be integer',
    'number.min': 'Page must be atleast 1'
  }),

  limit: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Limit must be number',
    'number.integer': 'Limit must be integer',
    'number.min': 'Limit must be atleast 1',
  }),

});

const updateTeacherLeaveSchema = Joi.object({
  leaveRequestId: Joi.string().required().messages({
    'string.base': 'Leave Request ID must be a string.',
    'any.required': 'Leave Request ID is required.',
  }),
  status: Joi.string().valid('accept', 'reject').required().messages({
    'string.base': 'Status must be a string',
    'any.only': 'Status must be either \'accept\', or \'reject\'',
    'any.required': 'Status is a mandatory field',
  }),
  username: Joi.when('status', {
    is: 'accept',
    then: Joi.string().required().messages({
      'string.base': 'Username must be a string',
      'any.required': 'Username is required',
    }),
    otherwise: Joi.forbidden().messages({
      'any.unknown': "Username is forbidden"
    }),
  }),
  password: Joi.when('status', {
    is: 'accept',
    then: Joi.string().required().messages({
      'string.base': 'Password must be a string',
      'any.required': 'Password is required',
    }),
    otherwise: Joi.forbidden().messages({
      'any.unknown': "Password is forbidden"
    }),
  }),
  tagline: Joi.when('status', {
    is: 'accept',
    then: Joi.string().required().messages({
      'string.base': 'Tagline must be a string',
      'any.required': 'Tagline is required',
    }),
    otherwise: Joi.forbidden().messages({
      'any.unknown': "Tagline is forbidden"
    }),
  })
})


export { registerLeaveSchema, updateTeacherLeaveSchema, getLeaveRequestsForAdminSchema }
