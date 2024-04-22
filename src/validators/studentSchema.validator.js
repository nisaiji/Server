import Joi from "joi";

const registerStudentSchema = Joi.object({
    rollNumber:Joi.string().min(5).max(20).required(),
    firstname:Joi.string().min(2).max(100).required(),
    lastname:Joi.string().min(2).max(100).required(),
    gender:Joi.string().valid('Male', 'Female', 'Non-binary', 'Other').required(),
    age:Joi.number().integer().min(3).max(100).required(),
    email:Joi.string().email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net", "org", "io", "co"] },
    }).required(),
    phone:Joi.string().pattern(/^\+91[6-9][0-9]{9}$/).length(13).required(),
    classStd:Joi.string().length(4),
    address:Joi.string().required(),
})


export {registerStudentSchema};