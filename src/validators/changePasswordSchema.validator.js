import Joi from "joi";

const registerChangePasswordRequestSchema = Joi.object({
  reason: Joi.string().valid("forgetPassword", "changeDevice").required().messages({
    "any.required": "Type is required",
    "string.valid": "Invalid reason"
  }),
  description: Joi.string().optional(),
  sender: Joi.object({
    phone: Joi.string().pattern(/^[6-9][0-9]{9}$/).length(10).messages({
        "string.pattern.base":
        "Phone number must have 10-digit number starting with 1-5.",
        "string.length": "Phone number must be exactly 10 characters long."
      }),
    model: Joi.string().valid("parent", "teacher", "admin").required().messages({
        "any.required": "Model is required.",
        "string.valid": "Model can be parent, teacher"
      })
  }).required().messages({
      "any.required": "Sender information is required"
    })
});

const getChangePasswordRequestsForAdminSchema = Joi.object({
  model: Joi.string().required().messages({
    "any.required": "Model is required.",
    "string.base": "Model must be a string."
  }),
  type: Joi.string().required().messages({
    "any.required": "Type is required.",
    "string.base": "Type must be a string."
  }),
  status: Joi.string().required().messages({
    "any.required": "Type is required.",
    "string.base": "Type must be a string."
  }),
  include: Joi.string().optional(),
  startTime: Joi.number().required().messages({
    "any.required": "Start time is required."
  }),
  endTime: Joi.number().required().messages({
    "any.required": "End time is required."
  }),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).default(10)
});

export { registerChangePasswordRequestSchema, getChangePasswordRequestsForAdminSchema };
// 1733509800000