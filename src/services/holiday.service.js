import holidayModel from "../models/holiday.model.js";

export async function getHolidayService(paramObj) {
  const holiday = await holidayModel.findOne(paramObj);
  return holiday;
}

export async function getHolidaysService(paramObj) {
  const holiday = await holidayModel.find(paramObj);
  return holiday;
}

export async function createHolidayService(data) {
  const holiday = await holidayModel.create(data);
  return holiday;
}

export async function updateHolidayService(filter, update) {
  const holiday = await holidayModel.findOneAndUpdate(filter, update);
  return holiday;
}

export async function deleteHolidayService(paramObj) {
  const holiday = await holidayModel.findOneAndDelete(paramObj);
  return holiday;
}

export async function getHolidayCountService(filter) {
  const count = await holidayModel.countDocuments(filter);
  return count;
}

export async function getHolidayPipelineService(pipeline) {
  const holidays = await holidayModel.aggregate(pipeline).exec();
  return holidays;
}
