import sessionModel from "../models/session.model.js";
import { convertToMongoId } from "./mongoose.services.js";

export async function getSessionService(paramObj){
  try {
    const session = await sessionModel.findOne(paramObj);//.select(projection);
    return session; 
  }catch (error) {
    throw error;    
  }
}

export async function registerSessionService( data ){
  try {
    const session = await sessionModel.create(data);
    return session;
  } catch (error) {
    throw error;
  }
}

export async function registerSessionsService(data)  {
  try{
    const sessions = await sessionModel.insertMany(data)          
    return sessions;
  } catch (error){
    throw error;
  }
}
 
export async function getSessionsService(paramObj, projection={}, populateObj=""){
  try {
    const sessions = await sessionModel.find(paramObj).select(projection).populate(populateObj);
    return sessions;
  } catch (error) {
    throw error;    
  }
}

export async function deleteSessionService(paramObj){
  try {
    const session = await sessionModel.deleteOne(paramObj);
    return session;
  } catch (error) {
    throw error;    
  }
}

export async function updateSessionService(filter, update){
  try {
    const session = await sessionModel.findOneAndUpdate(filter, update);
    return session;
  } catch (error) {
    throw error;    
  }
}

export async function updateSessionsService(filter, update){
  try {
    const session = await sessionModel.updateMany(filter, update);
    return session;
  } catch (error) {
    throw error;    
  }
}

export async function getSessionsPipelineService(pipeline){
  try {
    const sessions = await sessionModel.aggregate(pipeline).exec();
    return sessions;
  } catch (error) {
    throw error;    
  }
}

export async function getSessionCountService(filter){
  try {
    const sessions = await sessionModel.countDocuments(filter);
    return sessions;
  } catch (error) {
    throw error;  
  }
}
