import Joi from "joi";

const teacherLoginSchema = Joi.object({
  username: Joi.string().min(5).max(15).required(),
  password: Joi.string().pattern(new RegExp(/^[a-zA-Z0-9!@#$%^&*\?]{3,30}$/))
});

// school instance will register cordinator
const teacherRegisterSchema = Joi.object({
  username: Joi.string().min(5).max(15).required(),
  firstname: Joi.string().min(3).max(100).required(),
  lastname: Joi.string().min(3).max(100).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "org", "io", "co"] },
    })
    .required(),
  phone: Joi.string()
    .pattern(/^\+91[6-9][0-9]{9}$/)
    .length(13)
    .required(),
  password: Joi.string().pattern(new RegExp(/^[a-zA-Z0-9!@#$%^&*\?]{3,30}$/))
});

const markTeacherAsCordinatorSchema = Joi.object({
  teacherId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
})

const teacherDeleteSchema = Joi.object({
  teacherId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
})


export {teacherLoginSchema,teacherRegisterSchema,markTeacherAsCordinatorSchema,teacherDeleteSchema};
      