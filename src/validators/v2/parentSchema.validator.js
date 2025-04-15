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

const parentPasswordValidator = Joi.object({
  password: Joi.string().pattern(new RegExp(/^[a-zA-Z0-9!@#$%^&*\?]{3,30}$/)).required().min(8).max(16).messages({
    "string.pattern.base": "Password should contain only alphabets, numbers, and special characters.",
    "string.empty": "Password cannot be empty!",
    "any.required": "Password is required!",
    "string.min": "Password must be at least 8 characters long.",
    "string.max": "Password must not exceed 16 characters.",
    "string.base": "Password must be a valid string."
  })
});

const parentFullnameValidator = Joi.object({
  fullname: Joi.string().required().messages({
    "any.required": "full name is required."
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
  parentPasswordValidator,
  parentFullnameValidator,
  parentPhoneAndOtpValidator
}