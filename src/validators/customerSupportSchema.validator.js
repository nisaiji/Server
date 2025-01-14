import Joi from 'Joi'

const queryValidationSchema = Joi.object({
  firstname: Joi.string().required().messages({
    'any.required': 'First name is required',
    'string.empty': 'First name cannot be empty',
  }),
  lastname: Joi.string().required().messages({
    'any.required': 'Last name is required',
    'string.empty': 'Last name cannot be empty',
  }),
  schoolName: Joi.string().required().messages({
    'any.required': 'School name is required',
    'string.empty': 'School name cannot be empty',
  }),
  state: Joi.string().required().messages({
    'any.required': 'State is required',
    'string.empty': 'State cannot be empty',
  }),
  city: Joi.string().required().messages({
    'any.required': 'City is required',
    'string.empty': 'City cannot be empty',
  }),
  teacherCount: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Teacher count must be a number',
    'number.integer': 'Teacher count must be an integer',
    'number.min': 'Teacher count must be at least 1',
  }),
  source: Joi.string().optional().messages({
    'string.base': 'Source must be a string',
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Invalid email format',
  }),
  phone: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      'any.required': 'Phone number is required',
      'string.empty': 'Phone number cannot be empty',
      'string.pattern.base': 'Phone number must be a 10-digit number',
    }),
  message: Joi.string().optional().allow('').messages({
    'string.base': 'Message must be a string',
  }),
});

export { queryValidationSchema }
