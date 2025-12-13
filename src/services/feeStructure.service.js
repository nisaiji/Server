import feeStructureModel from "../models/feeStructure.model.js";

export async function getFeeStructureService(paramObj, projection={}){
  try {
    const feeStructure = await feeStructureModel.findOne(paramObj);
    return feeStructure; 
  }catch (error) {
    throw error;    
  }
}

export async function createFeeStructureService(data){
  try {
    const feeStructure = await feeStructureModel.create(data);
    return feeStructure;
  } catch (error) {
    throw error;
  }
}

export async function createFeeStructuresService(data)  {
  try{
    const feeStructures = await feeStructureModel.insertMany(data)          
    return feeStructures;
  } catch (error){
    throw error;
  }
}

export async function getFeeStructuresService(paramObj, projection={}, populateObj=""){
  try {
    const feeStructures = await feeStructureModel.find(paramObj).select(projection).populate(populateObj);
    return feeStructures;
  } catch (error) {
    throw error;    
  }
}

export async function deleteFeeStructureService(paramObj){
  try {
    const feeStructure = await feeStructureModel.deleteOne(paramObj);
    return feeStructure;
  } catch (error) {
    throw error;    
  }
}

export async function updateFeeStructureService(filter, update){
  try {
    const feeStructure = await feeStructureModel.findOneAndUpdate(filter, update);
    return feeStructure;
  } catch (error) {
    throw error;    
  }
}

export async function getFeeStructuresPipelineService(pipeline){
  try {
    const feeStructures = await feeStructureModel.aggregate(pipeline).exec();
    return feeStructures;
  } catch (error) {
    throw error;    
  }
}

export async function getFeeStructureCountService(filter){
  try {
    const FeeStructure = await feeStructureModel.countDocuments(filter);
    return feeStructures;
  } catch (error) {
    throw error;  
  }
  }
  