import Joi from "joi";

const createHolidayEventSchema = Joi.object({
  date: Joi.date().required(),
  name: Joi.string().required(),
  teacherHoliday: Joi.boolean().required(),
  studentHoliday: Joi.boolean().required(),
  description: Joi.string().allow('').optional(),
  adminId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
});
 
export {createHolidayEventSchema};