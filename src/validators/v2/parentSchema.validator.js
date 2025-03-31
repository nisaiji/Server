import Joi from "joi";

const parentSignupValidator = Joi.object({
    phone: Joi.string().pattern(/^[6-9][0-9]{9}$/).length(10).required().messages({
        "string.pattern.base": "Invalid phone number format",
        "string.length": "Phone number must be 10 characters",
        "any.required": "Phone number is required"
      })
});

export {
  parentSignupValidator
}