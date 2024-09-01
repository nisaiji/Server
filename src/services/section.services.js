import classModel from "../models/class.model.js";
import sectionModel from "../models/section.model.js";
import studentModel from "../models/student.model.js";
import teacherModel from "../models/teacher.model.js";


export async function getSectionService(paramObj){
  try {
    const section = await sectionModel.findOne(paramObj);
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
    // console.log("get section list called")
    const sections = await sectionModel
      .find({})
      .populate("students")
      // .populate("coordinator");
    // console.log(sections);
    return sections;
  } catch (error) {
    return error;
  }
}

export async function getClassSections(classId) {
  try {
    const sections = await sectionModel
      .find({ classId: classId }).populate('classTeacher');
      console.log(sections);
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

export async function findSectionInfoById({sectionId}){
  try {
    const section = await sectionModel.findById(sectionId).select({students:0}).populate({path:"classId",select:{"name":1}}).populate({path:"classTeacher",select:{firstname:1,lastname:1}});
    return section;
    
  } catch (error) {
    throw error;    
  }
}