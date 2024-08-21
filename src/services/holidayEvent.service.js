import holidayEventModel from "../models/holidayEvent.model.js";

export async function getHolidayEventService(paramObj) {
  try {
    const attendance = await holidayEventModel.findOne(paramObj);
    return attendance;
  } catch (error) {
    throw error;
  }
}

export async function createHolidayEventService(data){
  try {
    const{date, day, title, description, holiday, event, admin} = data;
    const holidayEvent = await holidayEventModel.new();
    
    if(date){
      holidayEvent["date"] = date;
    }
    if(day){
      holidayEvent["day"] = day;
    }
    if(description){
      holidayEvent["description"] = description;
    }
    if(title){
      holidayEvent["title"] = title;
    }
    if(holiday){
      holidayEvent["holiday"] = holiday;
    }
    if(event){
      holidayEvent["event"] = event;
    }
    if(admin){
      holidayEvent["admin"] = admin;
    }
    await holidayEvent.save();
    return holidayEvent;
  } catch (error) {
    throw error;
  }
}

export async function updateHolidayEventService(data){
  try {
    const{id, date, day, title, description, holiday, event, admin} = data;
    const holidayEvent = await holidayEventModel.findById(id);
    
    if(date){
      holidayEvent["date"] = date;
    }
    if(day){
      holidayEvent["day"] = day;
    }
    if(description){
      holidayEvent["description"] = description;
    }
    if(title){
      holidayEvent["title"] = title;
    }
    if(holiday){
      holidayEvent["holiday"] = holiday;
    }
    if(event){
      holidayEvent["event"] = event;
    }
    if(admin){
      holidayEvent["admin"] = admin;
    }
    await holidayEvent.save();
    return holidayEvent;
  } catch (error) {
    throw error;
  }
}


//----------------------------------------------------

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

export async function getEventList({ adminId,startOfMonth,endOfMonth }) {
  try {
    const holidayEventList = await holidayEventModel.find({ admin: adminId,date: {$gte:startOfMonth,$lte:endOfMonth} });
    return holidayEventList;
  } catch (error) {
    throw error;
  }
}

export async function updateHolidayEvent({eventId,title,description,holiday,event}){
  try {
    const holidayEvent = await holidayEventModel.findByIdAndUpdate(eventId,{title,description,holiday,event});
    return holidayEvent;
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