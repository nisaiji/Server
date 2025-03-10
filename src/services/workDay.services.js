import workDayModel from "../models/workDay.model.js";

export async function getWorkDayService(paramObj) {
  try {
    const workDay = await workDayModel.findOne(paramObj);
    return workDay;
  } catch (error) {
    throw error;
  }
}

export async function getWorkDaysService(paramObj) {
  try {
    const workDay = await workDayModel.find(paramObj);
    return workDay;
  } catch (error) {
    throw error;
  }
}

export async function createWorkDayService(data) {
  try {
    const workDay = await workDayModel.create(data);
    return workDay;
  } catch (error) {
    throw error;
  }
}

export async function updateWorkDayService(filter, update) {
  try {
    const workDay = await workDayModel.findOneAndUpdate(filter, update);
    return workDay;
  } catch (error) {
    throw error;
  }
}

export async function deleteWorkDayService(paramObj) {
  try {
    const workDay = await workDayModel.findOneAndDelete(paramObj);
    return workDay;
  } catch (error) {
    throw error;
  }
}

export async function getWorkDayCountService(filter){
  try {
    const count = await workDayModel.countDocuments(filter);
    return count;
  } catch (error) {
    throw error;  
  }
}
