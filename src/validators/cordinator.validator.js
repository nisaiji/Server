import Joi, { required } from "joi";

const registerSchema = Joi.object({
    username:Joi.string()
    .min(5)
    .max(15)
    .required()
    
} ) 