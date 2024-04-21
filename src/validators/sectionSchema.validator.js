import Joi from "joi";

const registerSectionSchema = Joi.object({
    name:Joi.string().min(3).max(20).required(),
    cordinatorId:Joi.string().required(),
});

export {registerSectionSchema};