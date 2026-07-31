import Joi from "joi";
import {
  PASSWORD_CHANGE_REASON,
  PASSWORD_CHANGE_SENDER_MODEL
} from "../enums/password.enums.js";

const registerChangePasswordRequestSchema = Joi.object({
  reason: Joi.string()
    .valid(...Object.values(PASSWORD_CHANGE_REASON))
    .required()
    .messages({
      "any.required": "reason is required",
      "string.valid": "Invalid reason"
    }),
  description: Joi.string().optional(),
  sender: Joi.object({
    phone: Joi.string()
      .pattern(/^[6-9][0-9]{9}$/)
      .length(10)
      .messages({
        "string.pattern.base":
          "Phone number must have 10-digit number starting with 1-5.",
        "string.length": "Phone number must be exactly 10 characters long."
      }),
    model: Joi.string()
      .valid(...Object.values(PASSWORD_CHANGE_SENDER_MODEL))
      .required()
      .messages({
        "any.required": "Model is required.",
        "string.valid": "Model can be parent, teacher"
      })
  })
    .required()
    .messages({
      "any.required": "Sender information is required"
    })
});

const getChangePasswordRequestsForAdminSchema = Joi.object({
  model: Joi.string().required().messages({
    "any.required": "Model is required.",
    "string.base": "Model must be a string."
  }),
  reason: Joi.string()
    .valid(
      PASSWORD_CHANGE_REASON.FORGET_PASSWORD,
      PASSWORD_CHANGE_REASON.CHANGE_DEVICE
    )
    .required()
    .messages({
      "any.required": "Reason is required",
      "string.valid": "Invalid reason"
    }),
  status: Joi.string().required().messages({
    "any.required": "Status is required",
    "string.base": "Status must be a string"
  }),
  include: Joi.string().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).default(10)
});

const updateChangePasswordRequestByAdminSchema = Joi.object({
  eventId: Joi.string().required().messages({
    "any.required": "Request Id is required.",
    "string.base": "Request Id must be a string."
  }),
  status: Joi.string().valid("accept", "reject").required().messages({
    "any.required": "Status is required",
    "string.base": "Status must be a string",
    "string.valid": "Invalid status"
  })
});

const verifyTeacherChangePasswordSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^[6-9][0-9]{9}$/)
    .length(10)
    .messages({
      "string.pattern.base":
        "Phone number must have a 10-digit number starting with 6-9",
      "string.length": "Phone number must be exactly 10 characters long"
    }),
  otp: Joi.number().integer().min(10000).max(99999).required().messages({
    "any.required": "OTP is required",
    "number.base": "OTP must be a number",
    "number.min": "OTP must have 5 digits",
    "number.max": "OTP must have 5 digits"
  }),
  deviceId: Joi.string().required().messages({
    "any.required": "Device ID is required"
  })
});

const changePasswordByVerifiedTeacherSchema = Joi.object({
  id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid id",
      "any.required": "Id is required"
    }),
  password: Joi.string().required().messages({
    "any.required": "Password is required."
  }),
  deviceId: Joi.string().required().messages({
    "any.required": "Device Id is required"
  })
});

export {
  registerChangePasswordRequestSchema,
  getChangePasswordRequestsForAdminSchema,
  updateChangePasswordRequestByAdminSchema,
  verifyTeacherChangePasswordSchema,
  changePasswordByVerifiedTeacherSchema
};
