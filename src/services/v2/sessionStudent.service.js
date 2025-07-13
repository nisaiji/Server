import sessionStudentModel from "../../models/v2/sessionStudent.model.js";

export async function getSessionStudentService(paramObj){
  try {
    const sessionStudent = await sessionStudentModel.findOne(paramObj);//.select(projection);
    return sessionStudent; 
  }catch (error) {
    throw error;    
  }
}

export async function registerSessionStudentService( data ){
  try {
    const sessionStudent = await sessionStudentModel.create(data);
    return sessionStudent;
  } catch (error) {
    throw error;
  }
}

export async function registerSessionStudentsService(data)  {
  try{
    const sessionStudent = await sessionStudentModel.insertMany(data)          
    return sessionStudent;
  } catch (error){
    throw error;
  }
}
 
export async function getSessionStudentsService(paramObj, projection={}, populateObj=""){
  try {
    const sessionStudent = await sessionStudentModel.find(paramObj).select(projection).populate(populateObj);
    return sessionStudent;
  } catch (error) {
    throw error;    
  }
}

export async function deleteSessionStudentService(paramObj){
  try {
    const sessionStudent = await sessionStudentModel.deleteOne(paramObj);
    return sessionStudent;
  } catch (error) {
    throw error;    
  }
}

export async function updateSessionStudentService(filter, update){
  try {
    const sessionStudent = await sessionStudentModel.findOneAndUpdate(filter, update);
    return sessionStudent;
  } catch (error) {
    throw error;    
  }
}

export async function getSessionStudentsPipelineService(pipeline){
  try {
    const sessionStudents = await sessionStudentModel.aggregate(pipeline).exec();
    return sessionStudents;
  } catch (error) {
    throw error;    
  }
}

export async function getSessionStudentCountService(filter){
  try {
    const sessionStudents = await sessionStudentModel.countDocuments(filter);
    return sessionStudents;
  } catch (error) {
    throw error;  
  }
}
