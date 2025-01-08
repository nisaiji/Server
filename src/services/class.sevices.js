import classModel from "../models/class.model.js";

export async function getClassService(paramObj){
  try {
    const classInfo = await classModel.findOne(paramObj);
    return classInfo;
  } catch (error) {
    throw error;    
  }
}

export async function getClassWithSectionsService(paramObj){
  try {
    const classes = await classModel.find(paramObj).populate({ path: "section", select: "_id name startTime" }).select("_id name startTime");
    return classes;
  } catch (error) {
    throw error;    
  }
}

export async function registerClassService(data){
  try {
    await classModel.create(data);
  } catch (error) {
    throw error;
  }

}

export async function deleteClassService(paramObj){
  try {
  const classInfo = await classModel.deleteOne(paramObj);
  return classInfo;  
  } catch (error) {
    throw error;    
  }
}

export async function updateClassService(filter, update){
  try {
    const classInfo = await classModel.updateOne(filter, update);
    return classInfo;
  } catch (error) {
    throw error;
  }
}

export async function customGetClassWithSectionTeacherService(paramObj){
  try {
    const classInfo = await classModel.find(paramObj).populate({path: 'section', select:{"name":1,"studentCount":1, "startTime":1}, populate: {path: 'teacher', select: 'firstname lastname' }}).lean();    ;
    return classInfo;
  } catch (error) {
    throw error;    
  }
}