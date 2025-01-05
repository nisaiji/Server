import Joi from "joi";

const registerSuperAdminSchema = Joi.object({
  username: Joi.string().min(5).max(20).required().messages({
    "string.min": "Username should be at least 5 characters long",
    "string.max": "Username should be less than 15 characters long",
    "any.required": "Username is required",
  }),
  email: Joi.string().email({ minDomainSegments: 2 }).required().messages({
    "string.email": "Invalid Email Id",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(5).max(16).pattern(new RegExp("^[a-zA-Z0-9!@#$%^&*]{3,30}$")).required().messages({
    "string.pattern.base": "Password must contain alphanumeric characters and special symbols",
    "string.min": "Password should be at least 8 characters long",
    "string.max": "Password should not exceed 16 characters",
    "any.required": "Password is required",
  }),
});

const loginSuperAdminSchema = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).required().messages({
    "string.email": "Invalid Email Id",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(8).max(16).required().messages({
    "string.min": "Password should be at least 8 characters long",
    "string.max": "Password should not exceed 16 characters",
    "any.required": "Password is required",
  }),
});

const updateSuperAdminSchema = Joi.object({
  username: Joi.string().min(5).max(15).messages({
    "string.min": "Username should be at least 5 characters long",
    "string.max": "Username should be less than 15 characters long",
  }),
  email: Joi.string().email({ minDomainSegments: 2 }).messages({
    "string.email": "Invalid Email Id",
  }),
  password: Joi.string().optional().min(8).max(16).pattern(new RegExp("^[a-zA-Z0-9!@#$%^&*]{3,30}$")).messages({
    "string.pattern.base": "Password must contain alphanumeric characters and special symbols",
    "string.min": "Password should be at least 8 characters long",
    "string.max": "Password should not exceed 16 characters",
  }),
});

const updateAdminSchema = Joi.object({
  active: Joi.boolean().required().messages({
      'any.required': '"active" is a required field.',
      'boolean.base': '"active" must be a boolean value.',
    }),
})

export { registerSuperAdminSchema, loginSuperAdminSchema, updateSuperAdminSchema, updateAdminSchema }