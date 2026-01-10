import refundModel from "../models/payments/refund.model.js";

export async function createRefundService(data) {
  try {
    const refund = await refundModel.create(data);
    return refund;
  } catch (error) {
    throw error;
  }
}

export async function getRefundService(filter) {
  try {
    const refund = await refundModel.findOne(filter).lean();
    return refund;
  } catch (error) {
    throw error;
  }
}

export async function getRefundCountService(filter) {
  try {
    const count = await refundModel.countDocuments(filter);
    return count;
  } catch (error) {
    throw error;
  }
}

export async function updateRefundService(filter, update) {
  try {
    const refund = await refundModel.updateOne(filter, update);
    return refund;
  } catch (error) {
    throw error;
  }
}

export async function getRefundPipelineService(pipeline) {
  try {
    const refunds = await refundModel.aggregate(pipeline).exec();
    return refunds;
  } catch (error) {
    throw error;
  }
}
