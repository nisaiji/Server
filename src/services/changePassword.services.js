import changePasswordRequestModel from "../models/changePasswordRequest.model.js";

export async function registerChangePasswordRequestService(paramObj){
  try {
    const event = await changePasswordRequestModel.create(paramObj);
    return event;
  } catch (error) {
    throw error;    
  }
}

export async function getChangePasswordRequestService(paramObj, projection={}){
  try {
    const event = await changePasswordRequestModel.findOne(paramObj).select(projection);
    return event; 
  }catch (error) {
    throw error;    
  }
}

export async function getChangePasswordRequestsPipelineService(pipeline){
  try {
    const events = await changePasswordRequestModel.aggregate(pipeline).exec();
    return events;
  } catch (error) {
    throw error;    
  }
}

export async function updateChangePasswordRequestService(filter, update) {
  try {
    const event = await changePasswordRequestModel.updateOne(filter, update);
    return event;
  } catch (error) {
    throw error;
  }
}

export async function getChangePasswordRequestCountService(filter){
  try {
    const events = await changePasswordRequestModel.countDocuments(filter);
    return events;
  } catch (error) {
    throw error;  
  }
}
