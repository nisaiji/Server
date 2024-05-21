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
    .pattern(/^\+91[6-9][0-9]{9}$/)
    .length(13)
    .messages({
      "string.pattern.base": "Phone number must start with +91 and be followed by a 10-digit number starting with 6-9.",
      "string.length": "Phone number must be exactly 13 characters long."
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
  username: Joi.string()
    .min(5)
    .max(15)
    .required()
    .messages({
      "string.min": "Username must be at least 5 characters long.",
      "string.max": "Username must be no more than 15 characters long.",
      "any.required": "Username is required."
    }),
  password: Joi.string()
    .pattern(/^[a-zA-Z0-9!@#$%^&*\?]{3,30}$/)
    .messages({
      "string.pattern.base": "Password must be 3-30 characters long and can include letters, numbers, and special characters !@#$%^&*?"
    }),
});

export { parentRegisterSchema, parentLoginSchema, existingParentRegisterSchema, parentUpdateSchema };
