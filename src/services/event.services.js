import eventModel from "../models/event.model.js";

export async function registerEventService(paramObj){
  try {
    const event = await eventModel.create(paramObj);
    return event;
  } catch (error) {
    throw error;    
  }
}

export async function getEventService(paramObj, projection={}){
  try {
    const event = await eventModel.findOne(paramObj).select(projection);
    return event; 
  }catch (error) {
    throw error;    
  }
}

export async function getEventsPipelineService(pipeline){
  try {
    const events = await eventModel.aggregate(pipeline).exec();
    return events;
  } catch (error) {
    throw error;    
  }
}

export async function updateEventService(filter, update) {
  try {
    const event = await eventModel.updateOne(filter, update);
    return event;
  } catch (error) {
    throw error;
  }
}

export async function getEventsCountService(filter){
  try {
    const events = await eventModel.countDocuments(filter);
    return events;
  } catch (error) {
    throw error;  
  }
}
