import schoolFeeStructureModel from "../../models/feeStructure/SchoolFeeStructure.model.js";

export async function getSchoolFeeStructureService(paramObj, projection = {}) {
  try {
    const schoolFeeStructure = await schoolFeeStructureModel.findOne(paramObj);
    return schoolFeeStructure;
  } catch (error) {
    throw error;
  }
}

export async function createSchoolFeeStructureService(data) {
  try {
    const schoolFeeStructure = await schoolFeeStructureModel.create(data);
    return schoolFeeStructure;
  } catch (error) {
    throw error;
  }
}

export async function createSchoolFeeStructuresService(data) {
  try {
    const schoolFeeStructures = await schoolFeeStructureModel.insertMany(data)
    return schoolFeeStructures;
  } catch (error) {
    throw error;
  }
}

export async function getSchoolFeeStructuresService(paramObj, projection = {}, populateObj = "") {
  try {
    const schoolFeeStructures = await schoolFeeStructureModel.find(paramObj).select(projection).populate(populateObj);
    return schoolFeeStructures;
  } catch (error) {
    throw error;
  }
}

export async function deleteSchoolFeeStructureService(paramObj) {
  try {
    const schoolFeeStructure = await schoolFeeStructureModel.deleteOne(paramObj);
    return schoolFeeStructure;
  } catch (error) {
    throw error;
  }
}

export async function updateSchoolFeeStructureService(filter, update) {
  try {
    const schoolFeeStructure = await schoolFeeStructureModel.findOneAndUpdate(filter, update);
    return schoolFeeStructure;
  } catch (error) {
    throw error;
  }
}

export async function getSchoolFeeStructuresPipelineService(pipeline) {
  try {
    const schoolFeeStructures = await schoolFeeStructureModel.aggregate(pipeline).exec();
    return schoolFeeStructures;
  } catch (error) {
    throw error;
  }
}

export async function getSchoolFeeStructureCountService(filter) {
  try {
    const schoolFeeStructures = await schoolFeeStructureModel.countDocuments(filter);
    return schoolFeeStructures;
  } catch (error) {
    throw error;
  }
}
