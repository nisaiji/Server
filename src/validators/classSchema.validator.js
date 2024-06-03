import Joi from 'joi';

const createClassSchema = Joi.object({
    name: Joi.string().required().messages({
        "any.required": "class name is required!"
      }),
});

export{createClassSchema};