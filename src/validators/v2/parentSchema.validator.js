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

const parentUpdateValidator = Joi.object({
  username: Joi.string().required().messages({
      'string.base': 'Username must be a string',
       "any.required": "username is required."
    }),

  fullname: Joi.string().required().messages({
      'string.base': 'Full name must be a string',
       "any.required": "full name is required."
    }),

  age: Joi.number().optional().messages({
      'number.base': 'Age must be a number'
    }),

  gender: Joi.string().valid('Male', 'Female', 'Other').optional().messages({
      'string.base': 'Gender must be a string',
      'any.only': 'Gender must be Male, Female, or Other'
    }),

  address: Joi.string().optional().messages({
      'string.base': 'Address must be a string'
    }),

  city: Joi.string().optional().messages({
      'string.base': 'City must be a string'
    }),

  district: Joi.string().optional().messages({
      'string.base': 'District must be a string'
    }),

  country: Joi.string().optional().messages({
      'string.base': 'Country must be a string'
    }),

  pincode: Joi.string().optional().messages({
      'string.base': 'Pincode must be a string'
    }),

  qualification: Joi.string().optional().messages({
      'string.base': 'Qualification must be a string'
    }),

  occupation: Joi.string().optional().messages({
      'string.base': 'Occupation must be a string'
    })
});

const parentPasswordEditValidator = Joi.object({
  newPassword: Joi.string().pattern(new RegExp(/^[a-zA-Z0-9!@#$%^&*\?]{3,30}$/)).required().min(8).max(16).messages({
    "string.pattern.base": "Password should contain only alphabets, numbers, and special characters.",
    "string.empty": "Password cannot be empty!",
    "any.required": "New password is required!",
    "string.min": "Password must be at least 8 characters long.",
    "string.max": "Password must not exceed 16 characters.",
    "string.base": "Password must be a valid string."
  }),
  oldPassword: Joi.string().pattern(new RegExp(/^[a-zA-Z0-9!@#$%^&*\?]{3,30}$/)).required().min(8).max(16).messages({
    "string.pattern.base": "Password should contain only alphabets, numbers, and special characters.",
    "string.empty": "Password cannot be empty!",
    "any.required": "Old password is required!",
    "string.min": "Password must be at least 8 characters long.",
    "string.max": "Password must not exceed 16 characters.",
    "string.base": "Password must be a valid string."
  })
});

const uploadParentPhotoValidator = Joi.object({
  photo: Joi.string().optional(),
  method: Joi.string().valid("POST", "DELETE").required().messages({
    "any.required": "method is required.",
    "string.empty": "method can not be an empty string.",
    "string.base": "method must be a string.",
    "any.only": 'method must be either "POST" or "DELETE".'
  })
});
const parentFcmTokenValidator = Joi.object({
  fcmToken: Joi.string().required().messages({
    "any.required": "FCM Token is required."
  })
});

const parentPhoneTokenValidator = Joi.object({
  phone: Joi.string().pattern(/^[6-9][0-9]{9}$/).message("invalid phone number").length(10).required().messages({
    "string.pattern": "invalid phone numberrr",
    "string.length": "Phone no. length should have 10 digits",
    "any.required": "Phone no is required!"
  }),
  token: Joi.string().required().messages({
    "any.required": "Token is required."
  })
});

const parentEmailTokenValidator = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.base': 'Email must be a text value',
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required'
  }),
  token: Joi.string().required().messages({
    "any.required": "Token is required."
  })
});

export {
  parentPhoneValidator,
  parentEmailValidator,
  parentPasswordValidator,
  parentFullnameValidator,
  parentPhoneAndOtpValidator,
  parentUpdateValidator,
  parentPasswordEditValidator,
  uploadParentPhotoValidator,
  parentFcmTokenValidator,
  parentPhoneTokenValidator,
  parentEmailTokenValidator,
}