import Joi from "joi";

const createHolidaySchema = Joi.object({
  date: Joi.date().required().messages({
    "any.required":"Date is required!"
  }),
  title: Joi.string().required().messages({
    "any.required":"Title is required!"
  }),
  description: Joi.string().allow('').optional()
});

const getHolidaySchema = Joi.object({
  startTime: Joi.date().required().messages({
    "any.required":"Start Date is required!"
  }),
  endTime: Joi.date().required().messages({
    "any.required":"End Date is required!"
  })
});
 
const updateHolidaySchema = Joi.object({
  title: Joi.string().required().messages({
    "any.required":"Title is required!"
  }),
  description: Joi.string().allow('').optional(),
});

export { createHolidaySchema, getHolidaySchema, updateHolidaySchema };
