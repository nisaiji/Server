import teacherModel from "../models/teacher.model.js";
import { convertToMongoId } from "./mongoose.services.js";

export async function getTeacherService(filter, projection={}) {
  try {
    const teacher = await teacherModel.findOne(filter).select(projection);
    return teacher;
  } catch (error) {
    throw error;
  }
}

export async function getTeachersService(paramObj){
  try {
    const teachers = await teacherModel.find(paramObj);
    return teachers;
  } catch (error) {
    throw error;
  }
}

export async function registerTeacherService(data) {
  try {
    const teacher = await teacherModel.create(data);
    return teacher;
  } catch (error) {
    throw error;
  }
}

export async function getAllTeacherOfAdminService(admin) {
  try {
    const teachers = await teacherModel.find({admin,isActive:true}).populate({path: "section", select: { name: 1 }, populate: {path: "classId",select: { name: 1 } }}).select({password:0,admin:0});
    return teachers;
  } catch (error) {
    return error;
  }
}

export async function updateTeacherService(filter, update){
  try {
      const teacher = await teacherModel.updateOne(filter, update);
      return teacher;
  } catch (error) {
    throw error;
  }
}

export async function getTeacherCountService(filter){
  try {
    const teachers = await teacherModel.countDocuments(filter);
    return teachers;
  } catch (error) {
    throw error;  
  }
}

export async function getTeachersByAdminIdService(adminId) {
  try {
    const teachers = await teacherModel.aggregate([
      {
        $match: {
          admin: convertToMongoId(adminId),
          isActive: true
        }
      }
    ])
    return teachers;
  } catch (error) {
    throw error;
  }
}

export async function getTeachersPipelineService(pipeline){
  try {
    const teachers = await teacherModel.aggregate(pipeline).exec();
    return teachers;
  } catch (error) {
    throw error;    
  }
}