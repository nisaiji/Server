import Joi from "joi";

export const adminPhoneValidator = Joi.object({
  phone: Joi.string().pattern(/^[6-9][0-9]{9}$/).message("invalid phone number").length(10).required().messages({
    "string.pattern": "invalid phone numberrr",
    "string.length": "Phone no. length should have 10 digits",
    "any.required": "Phone no is required!"
    })
});

export const adminPhoneAndOtpValidator = Joi.object({
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

export const adminPasswordUpdateValidator = Joi.object({
  password: Joi.string().pattern(new RegExp(/^[a-zA-Z0-9!@#$%^&*\?]{3,30}$/)).required().min(8).max(16).messages({
    "string.pattern.base": "Password should contain only alphabets, numbers, and special characters.",
    "string.empty": "Password cannot be empty!",
    "any.required": "Password is required!",
    "string.min": "Password must be at least 8 characters long.",
    "string.max": "Password must not exceed 16 characters.",
    "string.base": "Password must be a valid string."
  })
});

export const adminEmailValidator = Joi.object({
  email: Joi.string().email({minDomainSegments: 2}).required().messages({
    "string.email": "Invalid Email Id",
    "any.required": "Email is required"
  }),
})

export const adminEmailOtpValidator = Joi.object({
  otp: Joi.number().integer().min(10000).max(99999).required().messages({
    'number.base': 'OTP must be a number',
    'number.integer': 'OTP must be an integer',
    'number.min': 'OTP must be exactly 5 digits',
    'number.max': 'OTP must be exactly 5 digits',
    'any.required': 'OTP is required'
  }) 
})

export const adminDetailsValidator = Joi.object({
  affiliationNo: Joi.string().min(5).max(50).required().messages({
    "string.min": "Affiliation no. should be atleast 5 chars long",
    "string.max": "Affiliation no. length must be smaller than 50 chars",
    "any.required": "Affiliation no. is required!"
  }),
  schoolName: Joi.string().min(5).max(50).required().messages({
    "string.min": "School number should be atleast 5 chars long",
    "string.max": "School number length must be smaller than 50 chars",
  }),
  username: Joi.string().min(5).max(15).required().messages({
    "string.min": "admin name should be atleast 5 chars long",
    "string.max": "admin name length must be smaller than 15 chars",
    "any.required": "Admin name is required"
  }),
  
})
