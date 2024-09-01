import adminModel from "../models/admin.model.js";


export async function getAdminService(paramObj){
  try {
    const admin = await adminModel.findOne(paramObj).lean();
    return admin;
  } catch (error) {
    throw error;    
  }
}

export async function registerAdminService(data) {
  try {
    await adminModel.create(data);
  } catch (error) {
    throw error;
  }
}

export async function updateAdminByIdService(data){
  try {
    const{id, fieldsToBeUpdated} = data;
    const admin = await adminModel.findByIdAndUpdate(id, fieldsToBeUpdated).lean();
    return admin;
  } catch (error) {
    throw error;    
  }
}

