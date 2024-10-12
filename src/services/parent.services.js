import holidayEventModel from "../models/holidayEvent.model.js";
import parentModel from "../models/parent.model.js";
import studentModel from "../models/student.model.js";


export async function getParentService(filter, projection={} ){
  try {
    const parent = await parentModel.findOne(filter).select(projection);
    return parent;
  } catch (error) {
    throw error;
  }
}

export async function registerParentService( data ){
  try {
    const parent = await parentModel.create(data);
    return parent;
  } catch (error) {
    throw error;
  }
}

export async function updateParentService(filter, update){
  try {
    const student = await parentModel.findOneAndUpdate(filter, update);
    return student;
  } catch (error) {
    throw error;    
  }
}

