import Joi from "joi";
const parentRegisterSchema = Joi.object({
  studentId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
});
const parentUpdateSchema = Joi.object({
  parentId:Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(), 
  username: Joi.string().min(5).max(25),
  firstname: Joi.string().min(3).max(100),
  lastname: Joi.string().min(3).max(100),
  phone: Joi.string()
    .pattern(/^\+91[6-9][0-9]{9}$/)
    .length(13),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "org", "io", "co"] }
    }),
  password:Joi.string().pattern(new RegExp(/^[a-zA-Z0-9!@#$%^&*\?]{3,30}$/)),
  address: Joi.string(),
});

const existingParentRegisterSchema = Joi.object({
  studentId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  parentId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
})

const parentLoginSchema = Joi.object({
  username: Joi.string().min(5).max(15).required(),
  password: Joi.string().pattern(new RegExp(/^[a-zA-Z0-9!@#$%^&*\?]{3,30}$/))
});


// const parentUpdateSchema = Joi.object({
//   parentId:Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
// })
export { parentRegisterSchema, parentLoginSchema,existingParentRegisterSchema,parentUpdateSchema};
