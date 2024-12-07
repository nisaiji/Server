import changePasswordRequestModel from "../models/changePasswordRequest.model.js";

export async function registerChangePasswordRequestService(paramObj){
  try {
    const request = await changePasswordRequestModel.create(paramObj);
    return request;
  } catch (error) {
    throw error;    
  }
}

export async function getChangePasswordRequestService(paramObj, projection={}){
  try {
    const request = await changePasswordRequestModel.findOne(paramObj).select(projection);
    return request; 
  }catch (error) {
    throw error;    
  }
}

export async function getChangePasswordRequestsService(paramObj, projection={}){
  try {
    const requests = await changePasswordRequestModel.find(paramObj).select(projection);
    return requests; 
  }catch (error) {
    throw error;    
  }
}

export async function getChangePasswordRequestsPipelineService(pipeline){
  try {
    const requests = await changePasswordRequestModel.aggregate(pipeline).exec();
    return requests;
  } catch (error) {
    throw error;    
  }
}

export async function updateChangePasswordRequestService(filter, update) {
  try {
    const request = await changePasswordRequestModel.updateOne(filter, update);
    return request;
  } catch (error) {
    throw error;
  }
}

export async function updateChangePasswordRequestsService(filter, update) {
  try {
    const request = await changePasswordRequestModel.updateMany(filter, update);
    return request;
  } catch (error) {
    throw error;
  }
}

export async function getChangePasswordRequestCountService(filter){
  try {
    const requestCount = await changePasswordRequestModel.countDocuments(filter);
    return requestCount;
  } catch (error) {
    throw error;  
  }
}
