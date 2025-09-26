import studentExamResultModel from "../models/studentExamResult.model.js";

export async function getStudentExamResultService(paramObj) {
  try {
    const StudentExamResult = await studentExamResultModel.findOne(paramObj);
    return StudentExamResult;
  } catch (error) {
    throw error;
  }
}

export async function getStudentExamResultsService(paramObj){
  try {
    const StudentExamResults = await studentExamResultModel.find(paramObj);
    return StudentExamResults;
  } catch (error) {
    throw error;
  }
}

export async function getStudentExamResultsPipelineService(pipeline){
  try {
    const StudentExamResults = await studentExamResultModel.aggregate(pipeline).exec();
    return StudentExamResults;
  } catch (error) {
    throw error;    
  }
}

export async function getStudentExamResultStatusService(filter) {
  try {
    const studentExamResult = await studentExamResultModel.find(filter).select({status:0,_id:0,section:0,teacher:0}).sort({ date: 1 });;
    return studentExamResult;
  } catch (error) {
    throw error;
  }
}

export async function createStudentExamResultService(paramObj){
  try {
    const studentExamResult = await studentExamResultModel.create(paramObj)
    return studentExamResult;
  } catch (error){
    throw error;    
  }
}

export async function updateStudentExamResultService(filter, update){
  try {
    const studentExamResult = await studentExamResultModel.findOneAndUpdate(filter, update);;
    return studentExamResult;
  } catch (error){
    throw error;    
  }
}

export async function deleteStudentExamResultService(filter){
  try {
    const studentExamResult = await studentExamResultModel.findOneAndDelete(filter);
    return studentExamResult;
  } catch (error){
    throw error;    
  }
}