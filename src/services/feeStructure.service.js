import { feeStructureModel } from "../models/feeStructure.model.js";

export async function getFeeStructureService(paramObj, projection={}){
  try {
    const student = await feeStructureModel.findOne(paramObj);
    return student; 
  }catch (error) {
    throw error;    
  }
}

export async function createFeeStructureService(data){
  try {
    const student = await feeStructureModel.create(data);
    return student;
  } catch (error) {
    throw error;
  }
}

export async function createFeeStructuresService(data)  {
  try{
    const students = await feeStructureModel.insertMany(data)          
    return students;
  } catch (error){
    throw error;
  }
}

export async function getFeeStructuresService(paramObj, projection={}, populateObj=""){
  try {
    const students = await feeStructureModel.find(paramObj).select(projection).populate(populateObj);
    return students;
  } catch (error) {
    throw error;    
  }
}

export async function deleteFeeStructureService(paramObj){
  try {
    const student = await feeStructureModel.deleteOne(paramObj);
    return student;
  } catch (error) {
    throw error;    
  }
}

export async function updateFeeStructureService(filter, update){
  try {
    const student = await feeStructureModel.findOneAndUpdate(filter, update);
    return student;
  } catch (error) {
    throw error;    
  }
}

export async function getFeeStructuresPipelineService(pipeline){
  try {
    const students = await feeStructureModel.aggregate(pipeline).exec();
    return students;
  } catch (error) {
    throw error;    
  }
}

export async function getFeeStructureCountService(filter){
  try {
    const FeeStructure = await feeStructureModel.countDocuments(filter);
    return students;
  } catch (error) {
    throw error;  
  }
  }
  