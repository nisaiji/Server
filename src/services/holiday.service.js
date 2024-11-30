import holidayModel from "../models/holiday.model.js";

export async function getHolidayService(paramObj) {
  try {
    const holiday = await holidayModel.findOne(paramObj);
    return holiday;
  } catch (error) {
    throw error;
  }
}

export async function getHolidaysService(paramObj) {
  try {
    const holiday = await holidayModel.find(paramObj);
    return holiday;
  } catch (error) {
    throw error;
  }
}

export async function createHolidayService(data) {
  try {
    const holiday = await holidayModel.create(data);
    return holiday;
  } catch (error) {
    throw error;
  }
}

export async function updateHolidayService(filter, update) {
  try {
    const holiday = await holidayModel.findOneAndUpdate(filter, update);
    return holiday;
  } catch (error) {
    throw error;
  }
}

export async function deleteHolidayService(paramObj) {
  try {
    const holiday = await holidayModel.findOneAndDelete(paramObj);
    return holiday;
  } catch (error) {
    throw error;
  }
}
