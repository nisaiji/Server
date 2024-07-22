import Joi from "joi";

// const registerStudentSchema = Joi.object({
//   rollNumber: Joi.string().min(5).max(20).required().messages({
//     "string.min": "Roll number must be at least 5 chars.",
//     "string.max": "Roll number must be max 20 chars.",
//     "any.required": "Roll number is required.",
//   }),
//   firstname: Joi.string().min(2).max(100).required().messages({
//     "string.min": "First name must be at least 2 chars.",
//     "string.max": "First name must be max 100 chars.",
//     "any.required": "First name is required.",
//   }),
//   lastname: Joi.string().min(2).max(100).required().messages({
//     "string.min": "Last name must be at least 2 chars.",
//     "string.max": "Last name must be max 100 chars.",
//     "any.required": "Last name is required.",
//   }),
//   gender: Joi.string()
//     .valid("Male", "Female", "Non-binary", "Other")
//     .required()
//     .messages({
//       "any.only": "Gender must be Male, Female, Non-binary, or Other.",
//       "any.required": "Gender is required.",
//     }),
//   age: Joi.number().integer().min(3).max(100).required().messages({
//     "number.base": "Age must be a number.",
//     "number.min": "Age must be at least 3.",
//     "number.max": "Age must be max 100.",
//     "any.required": "Age is required.",
//   }),
//   email: Joi.string()
//     .email({
//       minDomainSegments: 2,
//       tlds: { allow: ["com", "net", "org", "io", "co"] },
//     })
//     .required()
//     .messages({
//       "string.email": "Invalid email.",
//       "any.required": "Email is required.",
//     }),
//   phone: Joi.string()
//     .pattern(/^[1-5][0-9]{9}$/)
//     .length(10)
//     .required()
//     .messages({
//       "string.pattern.base": "Invalid phone number.",
//       "string.length": "Phone number must be 10 chars.",
//       "any.required": "Phone number is required.",
//     }),
//   address: Joi.string().required().messages({
//     "string.base": "Invalid address.",
//     "any.required": "Address is required.",
//   }),
// });

const registerStudentSchema = Joi.object({
  rollNumber:Joi.string(),
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
  sectionId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({"string.pattern.base": "Invalid section ID.", "any.required": "section ID is required.",}),
  classId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({"string.pattern.base": "Invalid class ID.","any.required": "class ID is required.",}),
});

const updateStudentSchema = Joi.object({
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
});

const deleteStudentSchema = Joi.object({
  studentId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid student ID.",
      "any.required": "Student ID is required.",
    }),
});

const studentAddToSectionSchema = Joi.object({
  studentId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid student ID.",
      "any.required": "Student ID is required.",
    }),
  sectionId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid section ID.",
      "any.required": "Section ID is required.",
    }),
});

const parentUpdateStudentSchema = Joi.object({
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
const studentParentUpdateStudentSchema = Joi.object({
  rollNumber:Joi.string().required().messages({
    "any.required":"Roll Number is required"
  }),
  firstname:Joi.string().required().messages({
    "any.required":"first name is required"
  }),
  lastname:Joi.string().required().messages({
    "any.required":"last name is required"
  }),
  gender:Joi.string().required().messages({
    "any.required":"gender is required"
  }),
  bloodGroup: Joi.string().required().messages({
    "any.required": "Blood Group is required.",
  }),
  dob: Joi.string().required().messages({
    "any.required": "date of birth is required.",
  }),
  address: Joi.string().required().messages({
    "any.required": "Address is required.",
  }),
  parentFullname: Joi.string().required().messages({
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
  parentPhone: Joi.string().required().messages({
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

export {
  registerStudentSchema,
  deleteStudentSchema,
  studentAddToSectionSchema,
  updateStudentSchema,
  parentUpdateStudentSchema,
  studentParentUpdateStudentSchema
};
