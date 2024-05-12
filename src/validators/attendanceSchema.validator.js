import Joi from "joi";

const markPresentSchema = Joi.object({
    studentId:Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    sectionId:Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    isPresent:Joi.boolean().required(),
});


export{markPresentSchema};