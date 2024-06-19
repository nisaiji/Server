import classModel from "../models/class.model.js";
import sectionModel from "../models/section.model.js";
import teacherModel from "../models/teacher.model.js";





export async function checkClassExists({ name, adminId }) {
  try {
    const existClass = await classModel.findOne({
      $and: [{ name }, { admin: adminId }],
    });
    return existClass;
  } catch (error) {
    return error;
  }
}

export async function registerClass({ name, adminId }) {
  try {
    const registeredClass = await classModel.create({ name, admin: adminId });
    return registeredClass;
  } catch (error) {
    return error;
  }
}

export async function deleteClass(classId) {
  try {
    const deletedClass = await classModel.findByIdAndDelete(classId);
    await sectionModel.deleteMany({ classId });
  } catch (error) {
    return error;
  }
}

export async function getClassList(adminId) {
  try {
    const classes = await classModel
      .find({admin:adminId})
      .populate({ path: "section", select: "_id name" })
      .select("_id name");
    return classes;
  } catch (error) {
    return error;
  }
}

export async function findClassById(id) {
  try {
    const Class = await classModel.findById(id);
    return Class;
  } catch (error) {
    throw error;
  }
}

