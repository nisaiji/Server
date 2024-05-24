import holidayEventModel from "../models/holidayEvent.model.js";

export async function createHolidayEvent(data) {
  try {
    const {
      formattedDate,
      day,
      title,
      teacherHoliday,
      studentHoliday,
      description,
      adminId
    } = data;
    const holidayEvent = await holidayEventModel.create({
      date: formattedDate,
      day,
      title,
      teacherHoliday,
      studentHoliday,
      description,
      admin: adminId
    });
    return holidayEvent;
  } catch (error) {
    return error;
  }
}

export async function checkHolidayEventExist(data) {
  try {
    const { formattedDate, adminId } = data;
    const holidayEvent = await holidayEventModel.findOne({
      date: formattedDate,
      admin: adminId
    });
    return holidayEvent;
  } catch (error) {
    return error;
  }
}

export async function getEventList({ adminId }) {
  try {
    const holidayEventList = await holidayEventModel.find({ admin: adminId });
    // console.log(holidayEventList);
    return holidayEventList;
  } catch (error) {
    throw error;
  }
}

export async function getHolidayEventById({eventId}){
  try {
    const event = await holidayEventModel.findById(eventId);
    return event;
  } catch (error) {
    throw error;    
  }
}

export async function deleteHolidayEventById({eventId}){
  try {
    const event = await holidayEventModel.findByIdAndDelete(eventId);
    return event;
  } catch (error) {
    throw error;    
  }
}