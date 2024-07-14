import holidayEventModel from "../models/holidayEvent.model.js";

export async function createHolidayEvent(data) {
  try {
    const {currDate,day,title,holiday,event,description,adminId} = data;
    const holidayEvent = await holidayEventModel.create({
      date: currDate,
      day,
      title,
      holiday,
      event,
      description,
      admin: adminId
    });
    return holidayEvent;
  } catch (error) {
    return error;
  }
}

export async function checkHolidayEventExist({adminId,startOfDay,endOfDay}) {
  try {
    const holidayEvent = await holidayEventModel.findOne({
      date: {$gte:startOfDay,$lte:endOfDay},
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