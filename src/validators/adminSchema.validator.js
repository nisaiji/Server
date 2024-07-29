import Joi from "joi";

// register the school
const registerAdminSchema = Joi.object({
  adminName: Joi.string().min(5).max(15).required().messages({
    "string.min": "admin name should be atleast 5 chars long",
    "string.max": "admin name length must be smaller than 15 chars",
    "any.required": "admin name is required!"
  }),
  schoolName: Joi.string().min(8).max(500).required().messages({
    "string.min": "school name should be atleast 8 chars long",
    "string.max": "school name length must be smaller than 500 chars",
    "any.required": "school name is required!"
  }),
  affiliationNo: Joi.string().min(5).max(50).required().messages({
    "string.min": "Affiliation no. should be atleast 5 chars long",
    "string.max": "Affiliation no. length must be smaller than 50 chars",
    "any.required": "Affiliation no. is required!"
  }),

  phone: Joi.string()
    .pattern(/^[1-5][0-9]{9}$/)
    .message("invalid phone number")
    .length(10)
    .required()
    .messages({
      "string.pattern": "invalid phone numberrr",
      "string.length": "Phone no. length should have 10 digits",
      "any.required": "Phone no is required!"
    }),
  email: Joi.string()
    .email({
      minDomainSegments: 2
    })
    .required()
    .messages({
      "string.email": "Invalid Email Id",
      "any.required": "Email is required!"
    }),

  password: Joi.string()
    .pattern(new RegExp(/^[a-zA-Z0-9!@#$%^&*\?]{3,30}$/))
    .required()
    .min(8)
    .max(16)
    .messages({
      "string.pattern":
        "Password should contains alpha-numberic special symbols",
      "any.required": "Password is required!"
    }),
  address: Joi.string().required().messages({
    "string.required": "Address is required!"
  })
});
//  schoolName,principalName,schoolBoard, schoolNumber, affiliationNo, address,city,state, email, adminName
// register the school
const updateAdminProfileSchema = Joi.object({
  adminName: Joi.string().min(5).max(15).required().messages({
    "string.min": "admin name should be atleast 5 chars long",
    "string.max": "admin name length must be smaller than 15 chars",
    "any.required": "admin name is required!"
  }),
  schoolName: Joi.string().min(8).max(500).required().messages({
    "string.min": "school name should be atleast 8 chars long",
    "string.max": "school name length must be smaller than 500 chars",
    "any.required": "school name is required!"
  }),
  principalName: Joi.string().required().messages({
    "any.required": "Principal name is required!"
  }),
  schoolBoard: Joi.string().required().messages({
    "any.required": "School board is required!"
  }),
  affiliationNo: Joi.string().min(5).max(50).required().messages({
    "string.min": "Affiliation no. should be atleast 5 chars long",
    "string.max": "Affiliation no. length must be smaller than 50 chars",
    "any.required": "Affiliation no. is required!"
  }),
  schoolNumber: Joi.string().min(5).max(50).required().messages({
    "string.min": "School number should be atleast 5 chars long",
    "string.max": "School number length must be smaller than 50 chars",
    "any.required": "School number is required!"
  }),

  address: Joi.string().required().messages({
    "string.required": "Address is required!"
  }),
  city: Joi.string().required().messages({
    "string.required": "city is required!"
  }),
  state: Joi.string().required().messages({
    "string.required": "state is required!"
  })
});

// login school
const loginAdminSchema = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required."
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required!"
  })
});

export { registerAdminSchema, loginAdminSchema, updateAdminProfileSchema };
