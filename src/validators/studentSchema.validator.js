import Joi from "joi";

const registerStudentSchema = Joi.object({
  firstname: Joi.string().required().messages({
    "any.required": "First name is required.",
  }),
  lastname: Joi.string().required().messages({
    "any.required": "Last name is required.",
  }),
  parentName: Joi.string().required().messages({
    "any.required": "Parent name is required.",
  }),
  gender: Joi.string().required().messages({"any.required": "Gender is required.", }),
  phone: Joi.string().pattern(/^[1-5][0-9]{9}$/).length(10).required()  .messages({
    "string.pattern.base": "Invalid phone number.",
    "string.length": "Phone number must be 10 chars.",
    "any.required": "Phone number is required.",
  }),
  sectionId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    "string.pattern.base": "Invalid section ID.", 
    "any.required": "section ID is required."
  }),
});

const deleteStudentSchema = Joi.object({
  studentId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
      "string.pattern.base": "Invalid student ID.",
      "any.required": "Student ID is required.",
    }),
});

const getStudentsSchema = Joi.object({
    admin: Joi.string().optional().messages({
        'string.base': 'Admin must be a string.',
    }),

    classId: Joi.string().optional().messages({
        'string.base': 'Class ID must be a string.',
    }),

    section: Joi.string().optional().messages({
        'string.base': 'Section must be a string.',
    }),

    parent: Joi.string().optional().messages({
        'string.base': 'Parent must be a string.',
    }),

    student: Joi.string().optional().messages({
        'string.base': 'Student must be a string.',
    }),

    firstname: Joi.string().optional().messages({
        'string.base': 'First name must be a string.',
    }),

    lastname: Joi.string().optional().messages({
        'string.base': 'Last name must be a string.',
    }),

    gender: Joi.string().valid('male', 'female', 'other').optional().messages({
        'string.base': 'Gender must be a string.',
        'any.only': 'Gender can be male, female, or other.',
    }),

    page: Joi.number().integer().min(1).default(1).optional().messages({
        'number.base': 'Page must be a number.',
        'number.integer': 'Page must be an integer.',
        'number.min': 'Page must be at least 1.',
    }),

    include: Joi.string().optional().messages({
        'number.base': 'Include must be string.',
    }),

    limit: Joi.number().integer().min(1).max(100).default(10).optional().messages({
        'number.base': 'Limit must be a number.',
        'number.integer': 'Limit must be an integer.',
        'number.min': 'Limit must be at least 1.',
        'number.max': 'Limit must not exceed 100.',
    }),
});

const updateStudentByTeacherSchema = Joi.object({
  firstname: Joi.string().required().messages({
    "any.required": "First name is required.",
  }),
  lastname: Joi.string().required().messages({
    "any.required": "Last name is required.",
  }),
  parentName: Joi.string().required().messages({
    "any.required": "Parent name is required.",
  }),
  gender: Joi.string().required().messages({
    "any.required": "Gender is required.", 
  }),
  phone: Joi.string().pattern(/^[1-5][0-9]{9}$/).length(10).required().messages({
    "string.pattern.base": "Invalid phone number.",
    "string.length": "Phone number must be 10 chars.",
    "any.required": "Phone number is required.",
  }),
  photo: Joi.string().required().messages({ 
    "any.required": "Photo is required"
  }),
});

const updateStudentByAdminSchema = Joi.object({
  firstname: Joi.string().required().messages({
    "any.required": "First name is required.",
  }),
  lastname: Joi.string().required().messages({
    "any.required": "Last name is required.",
  }),
  parentName: Joi.string().required().messages({
    "any.required": "Parent name is required.",
  }),
  gender: Joi.string().required().messages({
    "any.required": "Gender is required.", 
  }),
  phone: Joi.string().pattern(/^[1-5][0-9]{9}$/).length(10).required().messages({
    "string.pattern.base": "Invalid phone number.",
    "string.length": "Phone number must be 10 chars.",
    "any.required": "Phone number is required.",
  }),
});

const updateStudentByParentSchema = Joi.object({
  bloodGroup: Joi.string().required().messages({
    "any.required": "Blood Group is required.",
  }),
  dob: Joi.string().required().messages({
    "any.required": "date of birth is required.",
  }),
  address: Joi.string().required().messages({
    "any.required": "Address is required.",
  }),
})

const updateStudentParentByAdminSchema = Joi.object({
  firstname:Joi.string().required().messages({
    "any.required":"first name is required"
  }),
  lastname:Joi.string().required().messages({
    "any.required":"last name is required"
  }),
  gender:Joi.string().required().messages({
    "any.required":"gender is required"
  }),
  dob:Joi.string().required().messages({
    "any.required":"DOB is required"
  }),
  address:Joi.string().required().messages({
    "any.required":"address is required"
  }),
  bloodGroup:Joi.string().required().messages({
    "any.required":"blood group is required"
  }),
  parentName: Joi.string().required().messages({
    "any.required": "parent name is required.",
  }),
  parentGender: Joi.string().required().messages({
    "any.required": "parent gender is required.",
  }),
  parentAge: Joi.number().required().messages({
    "any.required": "parent age is required.",
  }),
  parentEmail: Joi.string().required().messages({
    "any.required": "parent email is required.",
  }),
  phone: Joi.string().required().messages({
    "any.required": "parent phone number is required.",
  }),
  parentQualification: Joi.string().required().messages({
    "any.required": "parent qualification is required.",
  }),
  parentOccupation: Joi.string().required().messages({
    "any.required": "parent occupation is required.",
  }),
  parentAddress: Joi.string().required().messages({
    "any.required": "parent address is required.",
  }),
})

const uploadStudentPhotoSchema = Joi.object({
  photo: Joi.string().optional(),
  method: Joi.string().valid('POST', 'DELETE').required().messages({
    'any.required': 'method is required.',
    'string.empty': 'method can not be an empty string.',
    'string.base': 'method must be a string.',
    'any.only': 'method must be either "POST" or "DELETE".'
  })
})

export {
  getStudentsSchema,
  registerStudentSchema,
  deleteStudentSchema,
  updateStudentByTeacherSchema,
  updateStudentByAdminSchema,
  updateStudentByParentSchema,
  updateStudentParentByAdminSchema,
  uploadStudentPhotoSchema
};