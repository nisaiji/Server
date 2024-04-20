import Joi from "joi";

// register the school
const registerSchoolSchema = Joi.object({
  adminName: Joi.string()
    .min(5)
    .max(15)
    .required(),
  name: Joi.string().min(8).max(500).required(),
  affiliationNo: Joi.string().min(5).max(50).required(),
  phone: Joi.string()
    .pattern(/^\+91[6-9][0-9]{9}$/)
    .length(13)
    .required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "org", "io", "co"] }
    })
    .required(),
  password: Joi.string().pattern(new RegExp(/^[a-zA-Z0-9!@#$%^&*\?]{3,30}$/)),
  address: Joi.string().required()
});

// login school
const loginSchoolSchema = Joi.object({
    adminName: Joi.string()
    .min(3)
    .max(15)
    .required(),

    password: Joi.string()
    .pattern(new RegExp(/^[a-zA-Z0-9!@#$%^&*\?]{3,30}$/)),

})



export {registerSchoolSchema,loginSchoolSchema};
