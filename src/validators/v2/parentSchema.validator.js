import Joi from "joi";

const parentPhoneValidator = Joi.object({
  phone: Joi.string().pattern(/^[6-9][0-9]{9}$/).message("invalid phone number").length(10).required().messages({
    "string.pattern": "invalid phone numberrr",
    "string.length": "Phone no. length should have 10 digits",
    "any.required": "Phone no is required!"
    })
});

const parentEmailValidator = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.base': 'Email must be a text value',
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required'
  })
});

const parentPhoneAndOtpValidator = Joi.object({
  phone: Joi.string().pattern(/^[6-9][0-9]{9}$/).message("invalid phone number").length(10).required().messages({
    "string.pattern": "invalid phone numberrr",
    "string.length": "Phone no. length should have 10 digits",
    "any.required": "Phone no is required!"
    }),
 
    otp: Joi.number().integer().min(10000).max(99999).required().messages({
          'number.base': 'OTP must be a number',
          'number.integer': 'OTP must be an integer',
          'number.min': 'OTP must be exactly 5 digits',
          'number.max': 'OTP must be exactly 5 digits',
          'any.required': 'OTP is required'
    })    
});

export {
  parentPhoneValidator,
  parentEmailValidator,
  parentPhoneAndOtpValidator
}