import sectionAttendanceModel from "../models/sectionAttendance.model.js";

export async function getSectionAttendanceService(paramObj) {
  try {
    const attendance = await sectionAttendanceModel.findOne(paramObj);
    return attendance;
  } catch (error) {
    throw error;
  }
}

export async function getSectionAttendancesService(paramObj){
  try {
    const attendances = await sectionAttendanceModel.find(paramObj);
    return attendances;
  } catch (error) {
    throw error;
  }
}

export async function getSectionAttendanceStatusService(filter) {
  try {
    const attendance = await sectionAttendanceModel.find(filter).select({status:0,_id:0,section:0,teacher:0}).sort({ date: 1 });;
    return attendance;
  } catch (error) {
    throw error;
  }
}

export async function createSectionAttendanceService(paramObj){
  try {
    const sectionAttendance = await sectionAttendanceModel.create(paramObj)
    return sectionAttendance;
  } catch (error){
    throw error;    
  }
}

export async function updateSectionAttendanceService(filter, update){
  try {
    const sectionAttendance = await sectionAttendanceModel.findOneAndUpdate(filter, update);;
    return sectionAttendance;
  } catch (error){
    throw error;    
  }
}