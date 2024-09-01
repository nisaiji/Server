import holidayEventModel from "../models/holidayEvent.model.js";

export async function getHolidayEventService(paramObj) {
  try {
    const holidayEvent = await holidayEventModel.findOne(paramObj);
    return holidayEvent;
  } catch (error) {
    throw error;
  }
}

export async function getHolidayEventsService(paramObj) {
  try {
    const holidayEvents = await holidayEventModel.find(paramObj);
    return holidayEvents;
  } catch (error) {
    throw error;
  }
}

export async function createHolidayEventService(data) {
  try {
    const holidayEvent = await holidayEventModel.create(data);
    return holidayEvent;
  } catch (error) {
    throw error;
  }
}

export async function updateHolidayEventService(data) {
  try {
    const { id, fieldsToBeUpdated } = data;
    const holidayEvent = await holidayEventModel.findByIdAndUpdate(
      id,
      fieldsToBeUpdated
    );
    return holidayEvent;
  } catch (error) {
    throw error;
  }
}

export async function deleteHolidayEventService(paramObj) {
  try {
    const holidayEvent = await holidayEventModel.findOneAndDelete(paramObj);
    return holidayEvent;
  } catch (error) {
    throw error;
  }
}
