import Joi from "joi";

const teacherRegisterSchema = Joi.object({
  firstname: Joi.string().required().messages({
    "any.required": "First name is required."
  }),
  lastname: Joi.string().required().messages({
    "any.required": "Last name is required."
  }),
  phone: Joi.string().pattern(/^[1-5][0-9]{9}$/).length(10).required().messages({
    "string.pattern.base": "Invalid phone number format.",
    "string.length": "Phone number must be 10 characters.",
    "any.required": "Phone number is required."
    })
});

const teacherLoginSchema = Joi.object({
  user: Joi.string().required().messages({
    "any.required": "Phone number is required." 
  }),
  password: Joi.string().required().messages({ 
    "any.required": "Password is required."
  })
});

const teacherUsernamePasswordUpdateSchema = Joi.object({
  username: Joi.string().min(5).max(15).required().messages({ 
      "string.min":"username should be atleast 5 chars long",
      "string.max":"username can be atmost 15 chars long.",
      "any.required": "username is required"
     }),
  password:Joi.string().required()
});

const teacherEmailPhoneUpdateSchema = Joi.object({
  email: Joi.string().email({minDomainSegments: 2 }).optional().messages({
      "string.email": "Invalid email format.",
    }),
  phone: Joi.string().pattern(/^[1-5][0-9]{9}$/).length(10).required().messages({
      "string.pattern.base": "Invalid phone number format.",
      "string.length": "Phone number must be 10 characters.",
      "any.required": "Phone number is required."
    })
});

const teacherUpdateSchema = Joi.object({
  firstname: Joi.string().min(2).max(15).required().messages({ 
      "string.min":"firstname should be atleast 2 chars long",
      "string.max":"firstname can be atmost 15 chars long.",
      "any.required": "firstname is required"
    }),
  lastname: Joi.string().min(2).max(15).required().messages({ 
      "string.min":"lastname should be atleast 2 chars long",
      "string.max":"lastname can be atmost 15 chars long.",
      "any.required": "lastname is required"
    }),
  phone: Joi.string().pattern(/^[1-5][0-9]{9}$/).length(10).required().messages({
      "string.pattern.base": "Invalid phone number format.",
      "string.length": "Phone number must be 10 characters.",
      "any.required": "Phone number is required."
      }),
  email: Joi.string().email({minDomainSegments: 2 }).optional().messages({
      "string.email": "Invalid email format.",
      }),
  dob:Joi.string().optional(),
  
  bloodGroup:Joi.string().optional(),

  gender:Joi.string().optional(),

  university:Joi.string().optional(),

  degree:Joi.string().optional(),

  address: Joi.string().optional()


});

const teacherPhotoUpdateSchema = Joi.object({
  photo: Joi.string().optional(),
  method: Joi.string().valid('POST', 'DELETE').required().messages({
    'any.required': 'method is required.',
    'string.empty': 'method can not be an empty string.',
    'string.base': 'method must be a string.',
    'any.only': 'method must be either "POST" or "DELETE".'
    })
});

export {
  teacherLoginSchema,
  teacherUpdateSchema,
  teacherRegisterSchema,
  teacherUsernamePasswordUpdateSchema,
  teacherEmailPhoneUpdateSchema,
  teacherPhotoUpdateSchema
};
