import Joi from "joi";

const authSchema = Joi.object({
    email:Joi.string().email().lowercase().required(),
    password:joi.string().min(2).required(),

})

module.exports ={
    authSchema
}