import Joi from 'joi';
const parentRegisterSchema = Joi.object({
    username: Joi.string().min(5).max(15).required(),
    firstname: Joi.string().min(3).max(100).required(),
    lastname: Joi.string().min(3).max(100).required(),
    phone: Joi.string()
    .pattern(/^\+91[6-9][0-9]{9}$/)
    .length(13)
    .required(),
    email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "org", "io", "co"] },
    })
    .required(),
    password: Joi.string().pattern(new RegExp(/^[a-zA-Z0-9!@#$%^&*\?]{3,30}$/)),
    address: Joi.string().required()
});


const parentLoginSchema = Joi.object({
    username: Joi.string().min(5).max(15).required(),
    password: Joi.string().pattern(new RegExp(/^[a-zA-Z0-9!@#$%^&*\?]{3,30}$/))
});

export {parentRegisterSchema , parentLoginSchema};