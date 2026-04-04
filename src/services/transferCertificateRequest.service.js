import TransferCertificateRequestModel from "../models/TransferCertificateRequest.model.js";
import { convertToMongoId } from "./mongoose.services.js";

// Basic CRUD Operations
export async function getTransferCertificateRequestService(paramObj, projection = {}) {
  try {
    const request = await TransferCertificateRequestModel.findOne(paramObj).select(projection);
    return request;
  } catch (error) {
    throw error;
  }
}

export async function getTransferCertificateRequestsService(paramObj, projection = {}, populateObj = "") {
  try {
    const requests = await TransferCertificateRequestModel.find(paramObj).select(projection).populate(populateObj);
    return requests;
  } catch (error) {
    throw error;
  }
}

export async function registerTransferCertificateRequestService(data) {
  try {
    const request = await TransferCertificateRequestModel.create(data);
    return request;
  } catch (error) {
    throw error;
  }
}

export async function registerTransferCertificateRequestsService(data) {
  try {
    const requests = await TransferCertificateRequestModel.insertMany(data);
    return requests;
  } catch (error) {
    throw error;
  }
}

export async function updateTransferCertificateRequestService(filter, update) {
  try {
    const request = await TransferCertificateRequestModel.findOneAndUpdate(filter, update);
    return request;
  } catch (error) {
    throw error;
  }
}

export async function deleteTransferCertificateRequestService(paramObj) {
  try {
    const request = await TransferCertificateRequestModel.deleteOne(paramObj);
    return request;
  } catch (error) {
    throw error;
  }
}

export async function getTransferCertificateRequestCountService(filter) {
  try {
    const requestCount = await TransferCertificateRequestModel.countDocuments(filter);
    return requestCount;
  } catch (error) {
    throw error;
  }
}

export async function getTransferCertificateRequestsPipelineService(pipeline) {
  try {
    const result = await TransferCertificateRequestModel.aggregate(pipeline).exec();
    return result;
  } catch (error) {
    throw error;
  }
}

export async function getTransferCertificateRequestsWithPaginationService(filter, sortingLogic, skipNumber, limitNumber, projection = {}, populateOptions = []) {
  try {
    const requests = await TransferCertificateRequestModel
      .find(filter)
      .sort(sortingLogic)
      .limit(limitNumber)
      .skip(skipNumber)
      .select(projection)
      .populate(populateOptions);
    return requests;
  } catch (error) {
    throw error;
  }
}
