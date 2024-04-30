import sectionModel from "../models/section.model.js";
import teacherModel from "../models/teacher.model.js";

export async function checkTeacherExist(username, email) {
  try {
    const teacher = await teacherModel.findOne({
      $or: [{ username }, { email }]
    });
    return teacher;
  } catch (err) {
    return err;
  }
}

export async function createTeacher(
  username,
  firstname,
  lastname,
  email,
  password,
  phone
) {
  try {
    const teacher = await teacherModel.create({
      username,
      firstname,
      lastname,
      email,
      password,
      phone
    });
    return teacher;
  } catch (err) {
    return err;
  }
}

export async function findTeacherByUsername(username) {
  try {
    const teacher = await teacherModel.findOne({ username });
    return teacher;
  } catch (err) {
    return err;
  }
}

export async function findTeacherById(id) {
  try {
    const teacher = await teacherModel.findById(id);
    return teacher;
  } catch (error) {
    return error;
  }
}

export async function deleteTeacher(id) {
  try {
    const teacher = await teacherModel.findByIdAndDelete(id);
    await sectionModel.updateMany(
      { coordinator: id },
      { $unset: { coordinator: 1 } }
    );
    return teacher;
  } catch (error){
    return error;
  }
}

export async function getAllTeachers() {
  try {
    const teacherlist = await teacherModel.find({});
    return teacherlist;
  } catch (error) {
    return error;
  }
}
export async function getAllCordinators() {
  try {
    const cordinatorlist = await teacherModel.find({ isCordinator: true });
    return cordinatorlist;
  } catch (error) {
    return error;
  }
}
