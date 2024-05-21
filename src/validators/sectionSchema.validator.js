import Joi from "joi";

const registerSectionSchema = Joi.object({
  name: Joi.string().min(1).max(5).required().messages({
    "string.min": "name length should be at least 3 char long",
    "string.max": "name length should be smaller than 5 chars",
    "any.required": "name is required"
  }),
  classTeacherId: Joi.string().required(),
  classId: Joi.string().required()
});

export { registerSectionSchema };
