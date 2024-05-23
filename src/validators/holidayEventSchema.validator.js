import Joi from "joi";

const createHolidayEventSchema = Joi.object({
  date: Joi.date().required().messages({"any.required":"Date is required!"}),
  title: Joi.string().required().messages({"any.required":"Name is required!"}),
  teacherHoliday: Joi.boolean().required().messages({"any.required":"Teacher-holiday is required!"}),
  studentHoliday: Joi.boolean().required().messages({"any.required":"Student-holiday is required!"}),
  description: Joi.string().allow('').optional(),
  adminId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({"any.required":"Admin Id is required!"})
});
 
export {createHolidayEventSchema};