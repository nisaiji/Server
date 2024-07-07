import Joi from "joi";

const parentRegisterSchema = Joi.object({
  studentId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Student ID must be a valid 24-character hexadecimal string.",
      "any.required": "Student ID is required."
    }),
});

const parentUpdateSchema = Joi.object({
  parentId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Parent ID must be a valid 24-character hexadecimal string.",
      "any.required": "Parent ID is required."
    }),
  username: Joi.string()
    .min(5)
    .max(25)
    .messages({
      "string.min": "Username must be at least 5 characters long.",
      "string.max": "Username must be smaller than 25 characters long."
    }),
  firstname: Joi.string()
    .min(3)
    .max(100)
    .messages({
      "string.min": "First name must be at least 3 characters long.",
      "string.max": "First name must be smaller than 100 characters long."
    }),
  lastname: Joi.string()
    .min(3)
    .max(100)
    .messages({
      "string.min": "Last name must be at least 3 characters long.",
      "string.max": "Last name must be smaller than 100 characters long."
    }),
  phone: Joi.string()
    .pattern(/^[1-5][0-9]{9}$/)
    .length(10)
    .messages({
      "string.pattern.base": "Phone number must have 10-digit number starting with 1-5.",
      "string.length": "Phone number must be exactly 10 characters long."
    }),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .messages({
      "string.email": "Email must be a valid email address."
    }),
  password: Joi.string()
    .pattern(/^[a-zA-Z0-9!@#$%^&*\?]{3,30}$/)
    .messages({
      "string.pattern.base": "Password must be 3-30 characters long and can include letters, numbers, and special characters !@#$%^&*?"
    }),
  address: Joi.string()
    .messages({
      "string.base": "Address must be a string."
    }),
});
const parentProfileUpdateSchema = Joi.object({
      email: Joi.string()
      .email({
        minDomainSegments: 2,
      })
      .messages({
        "string.email": "Email must be a valid email address."
      }),
     phone: Joi.string()
    .pattern(/^[1-5][0-9]{9}$/)
    .length(10)
    .messages({
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

const existingParentRegisterSchema = Joi.object({
  studentId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Student ID must be a valid 24-character hexadecimal string.",
      "any.required": "Student ID is required."
    }),
  parentId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Parent ID must be a valid 24-character hexadecimal string.",
      "any.required": "Parent ID is required."
    }),
});

const parentLoginSchema = Joi.object({
  user: Joi.string()
    .min(5)
    .max(15)
    .required()
    .messages({
      "string.min": "user credentials must be at least 5 characters long.",
      "string.max": "user credentials must be no more than 15 characters long.",
      "any.required": "Username is required."
    }),
  password: Joi.string()
    .pattern(/^[a-zA-Z0-9!@#$%^&*\?]{3,30}$/)
    .messages({
      "string.pattern.base": "Password must be 3-30 characters long and can include letters, numbers, and special characters !@#$%^&*?"
    }),
});

const parentAuthUpdateSchema = Joi.object({
  username: Joi.string()
    .required()
    .messages({ 
      "any.required": "username is required" }),
  email: Joi.string()
      .email({
        minDomainSegments: 2,
      })
      .optional()
      .messages({
        "string.email": "Invalid email format.",
        "any.required": "Email is required."
      }),
  password:Joi.string().required()
});

export { parentRegisterSchema,parentProfileInfoUpdateSchema,  parentLoginSchema, existingParentRegisterSchema, parentUpdateSchema,parentAuthUpdateSchema,parentProfileUpdateSchema };
