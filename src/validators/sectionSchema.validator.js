import Joi from "joi";

const registerSectionSchema = Joi.object({
    name:Joi.string().min(3).max(20).required(),
    coordinatorId:Joi.string().required(),
});





export {registerSectionSchema};