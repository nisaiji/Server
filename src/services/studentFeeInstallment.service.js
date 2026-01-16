import studentFeeInstallmentModel from "../models/feeStructure/studentFeeInstallment.model.js";
import { convertToMongoId } from "./mongoose.services.js";

export async function getStudentFeeInstallmentsPipelineService(pipeline) {
  try {
    const studentFeeInstallments = await studentFeeInstallmentModel
      .aggregate(pipeline)
      .exec();
    return studentFeeInstallments;
  } catch (error) {
    throw error;
  }
}

export async function getStudentFeeInstallmentService(
  filter,
  projection = {},
  sortingLogic
) {
  try {
    const studentFeeInstallment = await studentFeeInstallmentModel
      .findOne(filter)
      .select(projection)
      .sort(sortingLogic)
      .lean();
    return studentFeeInstallment;
  } catch (error) {
    throw error;
  }
}

export async function getStudentFeeInstallmentsService(
  filter,
  projection = {},
  sortingLogic
) {
  try {
    const studentFeeInstallments = await studentFeeInstallmentModel
      .find(filter)
      .select(projection)
      .sort(sortingLogic)
      .lean();
    return studentFeeInstallments;
  } catch (error) {
    throw error;
  }
}

export async function registerStudentFeeInstallmentService(paramObj) {
  try {
    const event = await studentFeeInstallmentModel.create(paramObj);
    return event;
  } catch (error) {
    throw error;
  }
}

export async function updateStudentFeeInstallmentService(
  filter,
  update,
  options = {}
) {
  try {
    const event = await studentFeeInstallmentModel.updateOne(
      filter,
      update,
      options
    );
    return event;
  } catch (error) {
    throw error;
  }
}

export async function getStudentFeeInstallmentsCountService(filter) {
  try {
    const events = await studentFeeInstallmentModel.countDocuments(filter);
    return events;
  } catch (error) {
    throw error;
  }
}