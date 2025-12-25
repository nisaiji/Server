import sectionFeeStructureModel from "../../models/feeStructure/sectionFeeStructure.model.js";

export async function getSectionFeeStructureService(paramObj, projection = {}) {
  try {
    const sectionFeeStructure = await sectionFeeStructureModel.findOne(paramObj);
    return sectionFeeStructure;
  } catch (error) {
    throw error;
  }
}

export async function createSectionFeeStructureService(data) {
  try {
    const sectionFeeStructure = await sectionFeeStructureModel.create(data);
    return sectionFeeStructure;
  } catch (error) {
    throw error;
  }
}

export async function createSectionFeeStructuresService(data) {
  try {
    const sectionFeeStructures = await sectionFeeStructureModel.insertMany(data)
    return sectionFeeStructures;
  } catch (error) {
    throw error;
  }
}

export async function getSectionFeeStructuresService(paramObj, projection = {}, populateObj = "") {
  try {
    const sectionFeeStructures = await sectionFeeStructureModel.find(paramObj).select(projection).populate(populateObj);
    return sectionFeeStructures;
  } catch (error) {
    throw error;
  }
}

export async function deleteSectionFeeStructureService(paramObj) {
  try {
    const sectionFeeStructure = await sectionFeeStructureModel.deleteOne(paramObj);
    return sectionFeeStructure;
  } catch (error) {
    throw error;
  }
}

export async function updateSectionFeeStructureService(filter, update) {
  try {
    const sectionFeeStructure = await sectionFeeStructureModel.findOneAndUpdate(filter, update);
    return sectionFeeStructure;
  } catch (error) {
    throw error;
  }
}

export async function getSectionFeeStructuresPipelineService(pipeline) {
  try {
    const sectionFeeStructures = await sectionFeeStructureModel.aggregate(pipeline).exec();
    return sectionFeeStructures;
  } catch (error) {
    throw error;
  }
}

export async function getSectionFeeStructureCountService(filter) {
  try {
    const sectionFeeStructures = await sectionFeeStructureModel.countDocuments(filter);
    return sectionFeeStructures;
  } catch (error) {
    throw error;
  }
}
