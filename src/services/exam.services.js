import examModel from "../models/exam.model.js";

export async function getExamService(paramObj) {
  try {
    const exam = await examModel.findOne(paramObj);
    return exam;
  } catch (error) {
    throw error;
  }
}

export async function getExamsService(paramObj){
  try {
    const exams = await examModel.find(paramObj);
    return exams;
  } catch (error) {
    throw error;
  }
}

export async function getExamsPipelineService(pipeline){
  try {
    const exams = await examModel.aggregate(pipeline).exec();
    return exams;
  } catch (error) {
    throw error;    
  }
}

export async function getExamStatusService(filter) {
  try {
    const exam = await examModel.find(filter).select({status:0,_id:0,section:0,teacher:0}).sort({ date: 1 });;
    return exam;
  } catch (error) {
    throw error;
  }
}

export async function createExamService(paramObj){
  try {
    const exam = await examModel.create(paramObj)
    return exam;
  } catch (error){
    throw error;    
  }
}

export async function updateExamService(filter, update){
  try {
    const exam = await examModel.findOneAndUpdate(filter, update);;
    return exam;
  } catch (error){
    throw error;    
  }
}

export async function deleteExamService(filter){
  try {
    const exam = await examModel.findOneAndDelete(filter);
    return exam;
  } catch (error){
    throw error;    
  }
}