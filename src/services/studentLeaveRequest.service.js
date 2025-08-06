import studentLeaveRequestModel from "../models/studentLeaveRequest.model.js";

export async function getStudentLeaveRequestsPipelineService(pipeline){
  try {
    const leaveRequests = await studentLeaveRequestModel.aggregate(pipeline).exec();
    return leaveRequests;
  } catch (error) {
    throw error;
  }
}

export async function getStudentLeaveRequestService(filter, projection={}) {
  try {
    const leaveRequest = await studentLeaveRequestModel.findOne(filter).select(projection);
    return leaveRequest;
  } catch (error) {
    throw error;
  }
}

export async function getStudentLeaveRequestsService(filter, projection={}) {
  try {
    const leaveRequests = await studentLeaveRequestModel.find(filter).select(projection);
    return leaveRequests;
  } catch (error) {
    throw error;
  }
}

export async function registerStudentLeaveRequestService(paramObj){
  try {
    const leaveRequest = await studentLeaveRequestModel.create(paramObj);
    return leaveRequest;
  } catch (error) {
    throw error;    
  }
}

export async function updateStudentLeaveRequestService(filter, update) {
  try {
    const leaveRequest = await studentLeaveRequestModel.updateOne(filter, update);
    return leaveRequest;
  } catch (error) {
    throw error;
  }
}

export async function getStudentLeaveRequestsCountService(filter){
  try {
    const count = await studentLeaveRequestModel.countDocuments(filter);
    return count;
  } catch (error) {
    throw error;  
  }
}
