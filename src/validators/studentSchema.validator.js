import Joi from "joi";

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

const deleteStudentSchema = Joi.object({
  studentId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
      "string.pattern.base": "Invalid student ID.",
      "any.required": "Student ID is required.",
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

const studentParentUpdateStudentSchema = Joi.object({
  firstname:Joi.string().required().messages({
    "any.required":"first name is required"
  }),
  lastname:Joi.string().required().messages({
    "any.required":"last name is required"
  }),
  gender:Joi.string().required().messages({
    "any.required":"gender is required"
  }),
  parentFullname: Joi.string().required().messages({
    "any.required": "parent name is required.",
  }),
  parentPhone: Joi.string().required().messages({
    "any.required": "parent phone number is required.",
  }),
})

export {
  registerStudentSchema,
  deleteStudentSchema,
  updateStudentByTeacherSchema,
  updateStudentByAdminSchema,
  updateStudentByParentSchema,
  studentParentUpdateStudentSchema
};