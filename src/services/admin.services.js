import adminModel from "../models/admin.model.js";


export async function getAdminService(filter){
  try {
    const admin = await adminModel.findOne(filter).lean();
    return admin;
  } catch (error) {
    throw error;    
  }
}

export async function getAdminsService(filter, sortingLogic, skipNumber, limitNumber){
try {
  const admins = await adminModel.find(filter).sort(sortingLogic).skip(skipNumber).limit(limitNumber);
  return admins;
} catch (error) {
  throw error;  
}
}

export async function getAdminCountService(filter){
try {
  const admins = await adminModel.countDocuments(filter);
  return admins;
} catch (error) {
  throw error;  
}
}

export async function registerAdminService(data) {
  try {
    console.log({data})
    const admin = await adminModel.create(data);
    console.log({admin})
  } catch (error) {
    throw error;
  }
}

export async function updateAdminService(filter, update){
  try {
    const admin = await adminModel.updateOne(filter, update);
    return admin;
  } catch (error) {
    throw error;    
  }
}

