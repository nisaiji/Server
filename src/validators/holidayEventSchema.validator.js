import Joi from "joi";

const createHolidayEventSchema = Joi.object({
  date: Joi.date().required().messages({
    "any.required":"Date is required!"
  }),
  title: Joi.string().required().messages({
    "any.required":"Title is required!"
  }),
  holiday: Joi.boolean().required().messages({
    "any.required":"holiday(boolean) field is required!"
  }),
  event: Joi.boolean().required().messages({
    "any.required":"event(boolean) field is required!"
  }),
  description: Joi.string().allow('').optional(),

});

const getHolidayEventSchema = Joi.object({
  startTime: Joi.date().required().messages({
    "any.required":"Start Date is required!"
  }),
  endTime: Joi.date().required().messages({
    "any.required":"End Date is required!"
  })
});
 
const updateHolidayEventSchema = Joi.object({
  title: Joi.string().required().messages({
    "any.required":"Title is required!"
  }),
  holiday: Joi.boolean().required().messages({
    "any.required":"holiday(boolean) field is required!"
  }),
  event: Joi.boolean().required().messages({
    "any.required":"event(boolean) field is required!"
  }),
  description: Joi.string().allow('').optional(),
});

export {createHolidayEventSchema, getHolidayEventSchema, updateHolidayEventSchema};