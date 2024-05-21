import Joi from "joi";

const registerSectionSchema = Joi.object({
    name:Joi.string().min(3).max(20).required(),
    classTeacherId:Joi.string().required(),
    classId:Joi.string().required(),
});





export {registerSectionSchema};