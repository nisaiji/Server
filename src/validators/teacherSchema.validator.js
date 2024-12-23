import Joi from "joi";

const teacherRegisterSchema = Joi.object({
  firstname: Joi.string().required().messages({
    "any.required": "First name is required."
  }),
  lastname: Joi.string().required().messages({
    "any.required": "Last name is required."
  }),
  phone: Joi.string()
    .pattern(/^[6-9][0-9]{9}$/)
    .length(10)
    .required()
    .messages({
      "string.pattern.base": "Invalid phone number format.",
      "string.length": "Phone number must be 10 characters.",
      "any.required": "Phone number is required."
    })
});

const teacherLoginSchema = Joi.object({
  user: Joi.string().required().messages({
    "any.required": "user is required."
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required."
  }),
  platform: Joi.string().required().valid("app", "web").messages({
    "any.required": "Platform is required.",
    "any.only": "Only supports for 'app', 'web' "
  }),
  deviceId: Joi.string()
    .when("platform", {
      is: "app",
      then: Joi.optional(),
      otherwise: Joi.forbidden()
    })
});

const teacherUsernamePasswordUpdateSchema = Joi.object({
  username: Joi.string().min(5).max(15).required().messages({
    "string.min": "username should be atleast 5 chars long",
    "string.max": "username can be atmost 15 chars long.",
    "any.required": "username is required"
  }),
  password: Joi.string().required()
});

const teacherEmailPhoneUpdateSchema = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).optional().messages({
    "string.email": "Invalid email format."
  }),
  phone: Joi.string().pattern(/^[6-9][0-9]{9}$/).length(10).required().messages({
      "string.pattern.base": "Invalid phone number format.",
      "string.length": "Phone number must be 10 characters.",
    }),
  username: Joi.string().required()
});

const teacherUpdateSchema = Joi.object({
  firstname: Joi.string().min(2).max(15).required().messages({
    "string.min": "firstname should be atleast 2 chars long",
    "string.max": "firstname can be atmost 15 chars long.",
    "any.required": "firstname is required"
  }),
  lastname: Joi.string().min(2).max(15).required().messages({
    "string.min": "lastname should be atleast 2 chars long",
    "string.max": "lastname can be atmost 15 chars long.",
    "any.required": "lastname is required"
  }),
  phone: Joi.string()
    .pattern(/^[6-9][0-9]{9}$/)
    .length(10)
    .required()
    .messages({
      "string.pattern.base": "Invalid phone number format.",
      "string.length": "Phone number must be 10 characters.",
      "any.required": "Phone number is required."
    }),
  email: Joi.string().email({ minDomainSegments: 2 }).optional().messages({
    "string.email": "Invalid email format."
  }),

  dob: Joi.string()
    .optional()
    .pattern(/^(00|[0-2][0-9]|(3[0-1]))\/(0[0-9]|1[0-2])\/\d{4}$/)
    .messages({
      "string.pattern.base": "Invalid date format, use DD/MM/YYYY."
    })
    .custom((value, helpers) => {
      const [day, month, year] = value.split("/").map(Number);
      if (month === 2 && day > 29) {
        return helpers.message("February cannot have more than 29 days.");
      }
      if ([4, 6, 9, 11].includes(month) && day > 30) {
        return helpers.message(`Month ${month} cannot have more than 30 days.`);
      }
      if (String(day) === "0" || String(month) === "0") {
        return helpers.message("invalid day or month");
      }

      return value;
    }),

  bloodGroup: Joi.string().optional(),

  gender: Joi.string().optional(),

  university: Joi.string().optional(),

  degree: Joi.string().optional(),

  address: Joi.string().optional()
});

const teacherAddressUpdateSchema = Joi.object({
  country: Joi.string().min(2).max(100).required().messages({
    "string.base": "Country should be a string",
    "string.min": "Country must be at least 2 characters long",
    "string.max": "Country must be less than 100 characters long",
    "any.required": "Country is required"
  }),

  state: Joi.string().min(2).max(100).required().messages({
    "string.base": "State should be a string",
    "string.min": "State must be at least 2 characters long",
    "string.max": "State must be less than 100 characters long",
    "any.required": "State is required"
  }),

  district: Joi.string().min(2).max(100).optional().messages({
    "string.base": "District should be a string",
    "string.min": "District must be at least 2 characters long",
    "string.max": "District must be less than 100 characters long"
  }),

  city: Joi.string().min(2).max(100).required().messages({
    "string.base": "City should be a string",
    "string.min": "City must be at least 2 characters long",
    "string.max": "City must be less than 100 characters long",
    "any.required": "City is required"
  }),

  address: Joi.string().min(5).max(250).required().messages({
    "string.base": "Address should be a string",
    "string.min": "Address must be at least 5 characters long",
    "string.max": "Address must be less than 250 characters long",
    "any.required": "Address is required"
  }),

  pincode: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      "string.base": "Pincode should be a string",
      "string.pattern.base": "Pincode must be a 6-digit number",
      "any.required": "Pincode is required"
    })
});

const teacherPhotoUpdateSchema = Joi.object({
  photo: Joi.string().optional(),
  method: Joi.string().valid("POST", "DELETE").required().messages({
    "any.required": "method is required.",
    "string.empty": "method can not be an empty string.",
    "string.base": "method must be a string.",
    "any.only": 'method must be either "POST" or "DELETE".'
  })
});

export {
  teacherLoginSchema,
  teacherUpdateSchema,
  teacherRegisterSchema,
  teacherUsernamePasswordUpdateSchema,
  teacherEmailPhoneUpdateSchema,
  teacherPhotoUpdateSchema,
  teacherAddressUpdateSchema
};
