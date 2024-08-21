import Joi from "joi";

const markAttendanceByTeacherSchema = Joi.object({
  present: Joi.array().items(Joi.object()).required().messages({
      'array.base': 'Present should be an array of student IDs.',
      'array.includes': 'Each item in the present array must be a object.',
      'any.required': 'The present array is required.'
    }),
  absent: Joi.array().items(Joi.object()).required().messages({
      'array.base': 'Absent should be an array of student IDs.',
      'array.includes': 'Each item in the absent array must be a object.',
      'any.required': 'The absent array is required.'
    })
});


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
      "any.required": "firstname is required"}),
  lastname: Joi.string().min(2).max(15).required().messages({ 
      "string.min":"lastname should be atleast 2 chars long",
      "string.max":"lastname can be atmost 15 chars long.",
      "any.required": "lastname is required"}),
  phone: Joi.string().pattern(/^[1-5][0-9]{9}$/).length(10).required().messages({
        "string.pattern.base": "Invalid phone number format.",
        "string.length": "Phone number must be 10 characters.",
        "any.required": "Phone number is required."
      }),
  dob:Joi.string().required().messages({
    "any.required":"DOB is required."
  }),
  bloodGroup:Joi.string().required().messages({
    "any.required":"blood group is required."
  }),
  gender:Joi.string().required().messages({
    "any.required":"gender is required."
  }),
  university:Joi.string().required().messages({
    "any.required":"university is required."
  }),
  degree:Joi.string().required().messages({
    "any.required":"degree is required."
  }),
});

const teacherPhotoUpdateSchema = Joi.object({
  photo: Joi.string().required().messages({ 
      "any.required": "Photo is required"}),
});

export {
  teacherLoginSchema,
  teacherUpdateSchema,
  teacherRegisterSchema,
  teacherUsernamePasswordUpdateSchema,
  teacherEmailPhoneUpdateSchema,
  markAttendanceByTeacherSchema,
  teacherPhotoUpdateSchema
};
