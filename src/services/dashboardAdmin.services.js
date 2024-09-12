import parentModel from "../models/parent.model.js";
import studentModel from "../models/student.model.js";
import teacherModel from "../models/teacher.model.js";

export async function getStudentsCountOfSchoolService(admin){
  try {
    const count = studentModel.countDocuments({admin});
    return count;  
  } catch (error){
    throw error;   
  }
}

export async function getParentsCountOfSchoolService(admin){
  try {
    const count = parentModel.countDocuments({admin});
    return count;  
  } catch (error) {
    throw error;   
  }
}

export async function getTeachersCountOfSchoolService(admin){
  try {
    const count = teacherModel.countDocuments({admin});
    return count;  
  } catch (error) {
    throw error;   
  }
}
