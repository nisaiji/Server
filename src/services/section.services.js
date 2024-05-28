import classModel from "../models/class.model.js";
import sectionModel from "../models/section.model.js";
import studentModel from "../models/student.model.js";
import teacherModel from "../models/teacher.model.js";

export async function checkSectionExist(name, classId, adminId) {
  try {
    console.log({ name, classId, adminId });
    const section = await sectionModel.findOne({
      $and: [{ name }, { classId }, { admin: adminId }],
    });
    console.log(section);
    return section;
  } catch (error) {
    return error;
  }
}

export async function createSection(name, classTeacher, classId, admin) {
  try {
    const section = await sectionModel.create({
      name,
      classId,
      classTeacher,
      admin,
    });
    return section;
  } catch (error) {
    throw error;
    // return error;
  }
}

export async function findSectionById(_id) {
  try {
    const section = await sectionModel.findById({ _id });
    return section;
  } catch (error) {
    return error;
  }
}

export function checkStudentExistInSection(students, student) {
  return students.includes(student);
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
      .find({ classId: classId });
    return sections;
  } catch (error) {
    return error;
  }
}

export async function findSectionByClassTeacherId(id) {
  try {
    // console.log(id);
    const section = await sectionModel.findOne({ classTeacher: id });
    // console.log(section);
    return section;
  } catch (error) {
    return error;
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

export async function deleteSection(sectionId) {
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
