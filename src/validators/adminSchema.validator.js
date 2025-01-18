import Joi from "joi";

const registerAdminSchema = Joi.object({
  schoolName: Joi.string().min(8).max(500).required().messages({
    "string.min": "school name should be atleast 8 chars long",
    "string.max": "school name length must be smaller than 500 chars",
    "any.required": "School name is required"
  }),
  phone: Joi.string().pattern(/^[6-9][0-9]{9}$/).message("invalid phone number").length(10).required().messages({
    "string.pattern": "invalid phone numberrr",
    "string.length": "Phone no. length should have 10 digits",
    "any.required": "Phone no is required!"
    }),
  email: Joi.string().email({minDomainSegments: 2}).required().messages({
    "string.email": "Invalid Email Id",
    "any.required": "Email is required!"
    }),
  password: Joi.string().pattern(new RegExp(/^[a-zA-Z0-9!@#$%^&*\?]{3,30}$/)).required().min(8).max(16).messages({
    "string.pattern": "Password should contains alpha-numberic special symbols",
    "any.required": "Password is required!"
    }),
});

const adminAddressSchema = Joi.object({
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

  district: Joi.string().min(2).max(100).required().messages({
    'string.base': 'District should be a string',
    'string.min': 'District must be at least 2 characters long',
    'string.max': 'District must be less than 100 characters long',
    'any.required': 'District is required'
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
});

const adminDetailsSchema = Joi.object({
  username: Joi.string().min(5).max(15).required().messages({
    "string.min": "username should be atleast 5 chars long",
    "string.max": "username length must be smaller than 15 chars",
    "any.required": "username is required"
  }),

  affiliationNo: Joi.string().min(5).max(50).required().messages({
    "string.min": "Affiliation no. should be atleast 5 chars long",
    "string.max": "Affiliation no. length must be smaller than 50 chars",
    "any.required": "Affiliation no. is required"
  }),
});

const loginAdminSchema = Joi.object({
  email: Joi.string().email({minDomainSegments: 2}).required().messages({
    "string.email": "Invalid Email Id",
    "any.required": "Email is required!"
    }),
  password: Joi.string().pattern(new RegExp(/^[a-zA-Z0-9!@#$%^&*\?]{3,30}$/)).required().min(8).max(16).messages({
    "string.pattern": "Password should contains alpha-numberic special symbols",
    "any.required": "Password is required!"
    })
}); 

const updateAdminProfileSchema = Joi.object({
  username: Joi.string().min(5).max(15).required().messages({
    "string.min": "admin name should be atleast 5 chars long",
    "string.max": "admin name length must be smaller than 15 chars",
    "any.required": "Admin name is required"
  }),
  schoolName: Joi.string().min(8).max(500).required().messages({
    "string.min": "school name should be atleast 8 chars long",
    "string.max": "school name length must be smaller than 500 chars",
    "any.required": "School name is required"
  }),
  principal: Joi.string().required().messages({
    "any.required": "Principal name is required!"
  }),
  schoolBoard: Joi.string().required().messages({
    "any.required": "School board is required!"
  }),
  affiliationNo: Joi.string().min(5).max(50).required().messages({
    "string.min": "Affiliation no. should be atleast 5 chars long",
    "string.max": "Affiliation no. length must be smaller than 50 chars",
    "any.required": "Affiliation no. is required!"
  }),
  schoolNumber: Joi.string().min(5).max(50).messages({
    "string.min": "School number should be atleast 5 chars long",
    "string.max": "School number length must be smaller than 50 chars",
  }),

  email: Joi.string().email({minDomainSegments: 2}).required().messages({
    "string.email": "Invalid Email Id",
    "any.required": "Email is required!"
    }),

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

});

const updateAdminSocialProfileSchema = Joi.object({
  phone: Joi.string().pattern(/^[6-9][0-9]{9}$/).message("invalid phone number").length(10).required().messages({
    "string.pattern": "invalid phone numberrr",
    "string.length": "Phone no. length should have 10 digits",
    "any.required": "Phone no is required!"
    }),
  website: Joi.string(),
  facebook: Joi.string(),
  instagram: Joi.string(),
  linkedin: Joi.string(),
  twitter: Joi.string(),
  whatsapp: Joi.string(),
  youtube: Joi.string()
});

export {registerAdminSchema, adminAddressSchema, adminDetailsSchema, loginAdminSchema, updateAdminProfileSchema, updateAdminSocialProfileSchema};
