import Joi from "joi";

const markPresentSchema = Joi.object({
    studentId:Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({"any.required":"student id is required!"}),
    sectionId:Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({"any.required":"section id is required!"}),
    isPresent:Joi.boolean().required().messages({"any.required":"Please mark attendance."}),
});


export{markPresentSchema};