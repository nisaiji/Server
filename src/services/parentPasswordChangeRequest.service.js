import parentPasswordChangeRequestModel from "../models/parentPasswordChangeRequest.model.js";

export async function registerParentPasswordChangeRequestService(paramObj) {
  try {
    const request = await parentPasswordChangeRequestModel.create(paramObj);
    return request;
  } catch (error) {
    throw error;
  }
}

export async function getParentPasswordChangeRequestService(paramObj, projection = {}) {
  try {
    const request = await parentPasswordChangeRequestModel.findOne(paramObj).select(projection);
    return request;
  } catch (error) {
    throw error;
  }
}

export async function getParentPasswordChangeRequestsService(paramObj, projection = {}) {
  try {
    const requests = await parentPasswordChangeRequestModel.find(paramObj).select(projection);
    return requests;
  } catch (error) {
    throw error;
  }
}

export async function updateParentPasswordChangeRequestService(filter, update) {
  try {
    const request = await parentPasswordChangeRequestModel.updateOne(filter, update);
    return request;
  } catch (error) {
    throw error;
  }
}

export async function getParentPasswordChangeRequestCountService(filter) {
  try {
    const requestCount = await parentPasswordChangeRequestModel.countDocuments(filter);
    return requestCount;
  } catch (error) {
    throw error;
  }
}

export async function getParentPasswordChangeRequestPipelineService(pipeline) {
  try {
    const result = await parentPasswordChangeRequestModel.aggregate(pipeline);
    return result;
  } catch (error) {
    throw error;
  }
}
