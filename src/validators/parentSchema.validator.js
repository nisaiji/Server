import Joi from "joi";

const parentLoginSchema = Joi.object({
  user: Joi.string().min(5).max(15).required().messages({
      "string.min": "user credentials must be at least 5 characters long.",
      "string.max": "user credentials must be no more than 15 characters long.",
      "any.required": "Username is required."
    }),
  password: Joi.string().pattern(/^[a-zA-Z0-9!@#$%^&*\?]{3,30}$/).messages({
      "string.pattern.base": "Password must be 3-30 characters long and can include letters, numbers, and special characters !@#$%^&*?"
    }),
});

const parentAuthUpdateSchema = Joi.object({
  username: Joi.string().required().messages({ 
      "any.required": "username is required" }),
  email: Joi.string().email({minDomainSegments: 2,}).optional().messages({
        "string.email": "Invalid email format.",
        "any.required": "Email is required."
      }),
  password:Joi.string().required().messages({
    "any.required": "Password is required."
  })
});

const parentProfileUpdateSchema = Joi.object({
  email: Joi.string().email({minDomainSegments: 2}).messages({
    "string.email": "Email must be a valid email address."
  }),
 phone: Joi.string().pattern(/^[1-5][0-9]{9}$/).length(10).messages({
  "string.pattern.base": "Phone number must have 10-digit number starting with 1-5.",
  "string.length": "Phone number must be exactly 10 characters long."
}),
});

const parentProfileInfoUpdateSchema = Joi.object({
  fullname: Joi.string().required().messages({
    "any.required": "full name is required."
  }),
  age: Joi.number().required().messages({
    "any.required":"age is required."
  }),
  gender: Joi.string().required().messages({
    "any.required":"gender is required."
  }),
  address: Joi.string().required().messages({
    "any.required":"address is required."
  }),

  qualification: Joi.string().required().messages({
    "any.required":"qualification is required."
  }),
  occupation: Joi.string().required().messages({
    "any.required":"occupation is required."
  }),

});

const parentAddressUpdateSchema = Joi.object({
  country: Joi.string().min(2).max(100).required().messages({
    'string.base': 'Country should be a string',
    'string.min': 'Country must be at least 2 characters long',
    'string.max': 'Country must be less than 100 characters long',
    'any.required': 'Country is required'
  }),

  state: Joi.string().min(2).max(100).required().messages({
    'string.base': 'State should be a string',
    'string.min': 'State must be at least 2 characters long',
    'string.max': 'State must be less than 100 characters long',
    'any.required': 'State is required'
  }),

  district: Joi.string().min(2).max(100).optional().messages({
    'string.base': 'District should be a string',
    'string.min': 'District must be at least 2 characters long',
    'string.max': 'District must be less than 100 characters long'
  }),

  city: Joi.string().min(2).max(100).required().messages({
    'string.base': 'City should be a string',
    'string.min': 'City must be at least 2 characters long',
    'string.max': 'City must be less than 100 characters long',
    'any.required': 'City is required'
  }),

  address: Joi.string().min(5).max(250).required().messages({
    'string.base': 'Address should be a string',
    'string.min': 'Address must be at least 5 characters long',
    'string.max': 'Address must be less than 250 characters long',
    'any.required': 'Address is required'
  }),

  pincode: Joi.string().pattern(/^\d{6}$/).required().messages({
    'string.base': 'Pincode should be a string',
    'string.pattern.base': 'Pincode must be a 6-digit number',
    'any.required': 'Pincode is required'
  })
})

const parentPasswordChangeSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    "any.required":"oldPassword is required"
  }),
  newPassword: Joi.string().required().messages({
    "any.required":"newPassword is required"
  }),
})


export { 
  parentLoginSchema, 
  parentAuthUpdateSchema, 
  parentProfileUpdateSchema, 
  parentProfileInfoUpdateSchema, 
  parentPasswordChangeSchema,
  parentAddressUpdateSchema
};
