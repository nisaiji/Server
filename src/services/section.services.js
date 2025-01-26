import classModel from "../models/class.model.js";
import sectionModel from "../models/section.model.js";
import studentModel from "../models/student.model.js";
import teacherModel from "../models/teacher.model.js";


export async function getSectionService(paramObj, projection){
  try {
    const section = await sectionModel.findOne(paramObj).select(projection);
    return section;
  } catch (error) {
    throw error;    
  }
}

export async function getSectionsService(paramObj){
  try {
   const sections = await sectionModel.find(paramObj).lean();
   return sections; 
  } catch (error) {
    throw error;
  }
}

export async function registerSectionService(data){
  try {
    const section = await sectionModel.create(data);
    return section;
  } catch (error) {
    throw error;    
  }
}

export async function getSectionByIdService(id){
  try {
    const section = await sectionModel.findById(id);
    return section;
  } catch (error) {
    throw error;
  }
}


export async function deleteSectionService(paramObj){
  try {
    const section = await sectionModel.findOneAndDelete(paramObj);
  } catch (error) {
    throw error;    
  }
}

export async function updateSectionService(filter, update){
  try {
    const section = await sectionModel.findOneAndUpdate(filter, update);
    return section;
  } catch (error) {
    throw error;    
  }
}

export async function findSectionById(_id) {
  try {
    const section = await sectionModel.findById({ _id });
    return section;
  } catch (error) {
    throw error;
  }
}



export async function getAllSection() {
  try {
    const sections = await sectionModel
      .find({})
      .populate("students")
      // .populate("coordinator");
    return sections;
  } catch (error) {
    return error;
  }
}

export async function getClassSections(classId) {
  try {
    const sections = await sectionModel
      .find({ classId: classId }).populate('classTeacher');
    return sections;
  } catch (error) {
    return error;
  }
}

export async function getSectionByTeacherId(id) {
  try {
    const section = await sectionModel.findOne({ teacher: id });
    return section;
  } catch (error) {
    throw error;
  }
}

export async function checkClassExistById(classId) {
  try {
    const classExist = await classModel.findById(classId);
    return classExist;
  } catch (error) {
    return error;
  }
}

// export async function deleteSection(sectionId) {
//   try {
//     const section = await sectionModel.findByIdAndDelete(sectionId);
//     await teacherModel.updateOne(
//       { _id: section.classTeacher },
//       { $pull: { section: sectionId } }
//     );
//     await classModel.updateOne(
//       { _id: section.classId },
//       { $pull: { section: sectionId } }
//     );
//     await studentModel.updateMany({});
//     return section;
//   } catch (error) {
//     return error;
//   }
// }

export async function deleteSection({sectionId}) {
  try {
    const section = await sectionModel.findByIdAndDelete(sectionId);
    await classModel.updateOne(
      { _id: section.classId },
      { $pull: { section: sectionId } }
    );
    return section;
  } catch (error) {
    return error;
  }
}

export async function getSectionStudents({sectionId,adminId}){
  const students = await studentModel.find({section:sectionId,admin:adminId});
  return students;
}

