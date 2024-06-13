import Joi from "joi";

const classTeacherLoginSchema = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required."
  }),
  password: Joi.string()
    .pattern(new RegExp(/^[a-zA-Z0-9!@#$%^&*\?]{3,30}$/))
    .messages({
      "string.pattern.base": "Invalid password format.",
    })
    .required()
    .messages({
      "any.required": "Password is required."
    })
});

const teacherRegisterSchema = Joi.object({
  username: Joi.string().min(5).max(15).required().messages({
    "string.min": "Username must be at least 5 characters.",
    "string.max": "Username must be at most 15 characters.",
    "any.required": "Username is required."
  }),
  firstname: Joi.string().min(3).max(100).required().messages({
    "string.min": "First name must be at least 3 characters.",
    "string.max": "First name must be at most 100 characters.",
    "any.required": "First name is required."
  }),
  lastname: Joi.string().min(3).max(100).required().messages({
    "string.min": "Last name must be at least 3 characters.",
    "string.max": "Last name must be at most 100 characters.",
    "any.required": "Last name is required."
  }),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "org", "io", "co"] }
    })
    .required()
    .messages({
      "string.email": "Invalid email format.",
      "any.required": "Email is required.",
    }),
  phone: Joi.string()
    .pattern(/^[1-5][0-9]{9}$/)
    .length(10)
    .required()
    .messages({
      "string.pattern.base": "Invalid phone number format.",
      "string.length": "Phone number must be 10 characters.",
      "any.required": "Phone number is required."
    }),
  password: Joi.string()
    .pattern(new RegExp(/^[a-zA-Z0-9!@#$%^&*\?]{3,30}$/))
    .messages({
      "string.pattern.base": "Invalid password format.",
    })
    .required()
    .messages({
      "any.required": "Password is required."
    })
});

const teacherUpdateSchema = Joi.object({
  teacherId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid teacher ID format.",
      "any.required": "Teacher ID is required."
    }),
  firstname: Joi.string().min(3).max(100).required().messages({
    "string.min": "First name must be at least 3 characters.",
    "string.max": "First name must be at most 100 characters.",
    "any.required": "First name is required."
  }),
  lastname: Joi.string().min(3).max(100).required().messages({
    "string.min": "Last name must be at least 3 characters.",
    "string.max": "Last name must be at most 100 characters.",
    "any.required": "Last name is required."
  }),

  phone: Joi.string()
    .pattern(/^[1-5][0-9]{9}$/)
    .length(10)
    .required()
    .messages({
      "string.pattern.base": "Invalid phone number format.",
      "string.length": "Phone number must be 10 characters.",
      "any.required": "Phone number is required."
    }),
  dob: Joi.string().required().messages({
    "any.required": "date of birth is required."
  }),
  bloodGroup: Joi.string().required().messages({
    "any.required": "blood group is required."
  }),
  gender: Joi.string().required().messages({
    "any.required": "gender is required."
  }),
  university: Joi.string().required().messages({
    "any.required": "university is required."
  }),
  degree: Joi.string().required().messages({
    "any.required": "degree is required."
  })
});
const teacherUpdationSchema = Joi.object({
  teacherId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid teacher ID format.",
      "any.required": "Teacher ID is required."
    }),
  username: Joi.string().min(5).max(15).required().messages({
    "string.min": "Username must be at least 5 characters.",
    "string.max": "Username must be at most 15 characters.",
    "any.required": "Username is required."
  }),
  firstname: Joi.string().min(3).max(100).required().messages({
    "string.min": "First name must be at least 3 characters.",
    "string.max": "First name must be at most 100 characters.",
    "any.required": "First name is required."
  }),
  lastname: Joi.string().min(3).max(100).required().messages({
    "string.min": "Last name must be at least 3 characters.",
    "string.max": "Last name must be at most 100 characters.",
    "any.required": "Last name is required."
  }),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "org", "io", "co"] }
    })
    .optional()
    .messages({
      "string.email": "Invalid email format.",
      "any.required": "Email is required.",
    }),
  phone: Joi.string()
    .pattern(/^\+91[0-5][0-9]{9}$/)
    .length(13)
    .optional()
    .messages({
      "string.pattern.base": "Invalid phone number format.",
      "string.length": "Phone number must be 13 characters.",
      "any.required": "Phone number is required."
    })
});

const markTeacherAsClassTeacherSchema = Joi.object({
  teacherId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid teacher ID format.",
      "any.required": "Teacher ID is required."
    })
});

const teacherDeleteSchema = Joi.object({
  teacherId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid teacher ID format.",
      "any.required": "Teacher ID is required."
    })
});

export {
  classTeacherLoginSchema,
  teacherUpdateSchema,
  teacherUpdationSchema,
  teacherRegisterSchema,
  markTeacherAsClassTeacherSchema,
  teacherDeleteSchema
};
