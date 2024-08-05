import Joi from "joi";

const parentForgetPasswordSchema = Joi.object({
  eventType: Joi.string().required().messages({
      "any.required": "Notification event type is required."
    }),
  title:Joi.string().required().messages({
    "any.required":"Title is required."
  }),
  description:Joi.string().required().messages({
    "any.required":"Description is required."
  })
});

const teacherForgetPasswordSchema = Joi.object({
  eventType: Joi.string().required().messages({
      "any.required": "Notification event type is required."
    }),
  sender: Joi.string().required().messages({
    "any.required": "Sender id is required."
  }),
  receiver: Joi.string().required({
    "any.required":"Receiver id is required."
  }),
  title:Joi.string().required().messages({
    "any.required":"Title is required."
  }),
  description:Joi.string().required().messages({
    "any.required":"Title is required."
  })
});

export {parentForgetPasswordSchema,teacherForgetPasswordSchema};