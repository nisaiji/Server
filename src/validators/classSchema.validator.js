import Joi from 'joi';

const createClassSchema = Joi.object({
    name: Joi.string().required().messages({
        "any.required": "Class name is required!"
      }),
    sessionId: Joi.string().required().messages({
      "any.required": "Session Id is required.",
      "string.base": "Session Id must be a string."
    }),
});

export{ createClassSchema };