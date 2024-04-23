import Joi from "joi";

const registerSectionSchema = Joi.object({
    name:Joi.string().min(3).max(20).required(),
    cordinatorId:Joi.string().required(),
});


const studentAddToSectionSchema = Joi.object({
   studentId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
   sectionId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required() 
})


export {registerSectionSchema,studentAddToSectionSchema};