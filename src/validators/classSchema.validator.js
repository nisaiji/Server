import Joi from 'joi';

const createClassSchema = Joi.object({
    name: Joi.string().required().messages({
        "any.required": "Class name is required!"
      }),
});

export{createClassSchema};