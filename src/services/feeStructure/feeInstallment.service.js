import feeInstallmentModel from "../../models/feeStructure/feeInstallment.model.js";

export async function getFeeInstallmentService(paramObj, projection = {}) {
  try {
    const feeInstallment = await feeInstallmentModel.findOne(paramObj);
    return feeInstallment;
  } catch (error) {
    throw error;
  }
}

export async function createFeeInstallmentService(data) {
  try {
    const feeInstallment = await feeInstallmentModel.create(data);
    return feeInstallment;
  } catch (error) {
    throw error;
  }
}

export async function createFeeInstallmentsService(data) {
  try {
    const feeInstallments = await feeInstallmentModel.insertMany(data)
    return feeInstallments;
  } catch (error) {
    throw error;
  }
}

export async function getFeeInstallmentsService(paramObj, projection = {}, populateObj = "") {
  try {
    const feeInstallments = await feeInstallmentModel.find(paramObj).select(projection).populate(populateObj);
    return feeInstallments;
  } catch (error) {
    throw error;
  }
}

export async function deleteFeeInstallmentService(paramObj) {
  try {
    const feeInstallment = await feeInstallmentModel.deleteOne(paramObj);
    return feeInstallment;
  } catch (error) {
    throw error;
  }
}

export async function updateFeeInstallmentService(filter, update) {
  try {
    const feeInstallment = await feeInstallmentModel.findOneAndUpdate(filter, update);
    return feeInstallment;
  } catch (error) {
    throw error;
  }
}

export async function getFeeInstallmentsPipelineService(pipeline) {
  try {
    const feeInstallment = await feeInstallmentModel.aggregate(pipeline).exec();
    return feeInstallment;
  } catch (error) {
    throw error;
  }
}

export async function getFeeInstallmentCountService(filter) {
  try {
    const count = await feeInstallmentModel.countDocuments(filter);
    return count;
  } catch (error) {
    throw error;
  }
}
