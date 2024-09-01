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
    const classes = await classModel.find(paramObj).populate({ path: "section", select: "_id name" }).select("_id name");
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