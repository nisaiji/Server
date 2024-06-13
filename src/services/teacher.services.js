import sectionModel from "../models/section.model.js";
import teacherModel from "../models/teacher.model.js";

export async function checkTeacherExist(username, email) {
  try {
    const teacher = await teacherModel.findOne({
      $or: [{ username }, { email }],
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
  phone,
  admin
) {
  try {
    const teacher = await teacherModel.create({
      username,
      firstname,
      lastname,
      email,
      password,
      phone,
      admin,
    });
    return teacher;
  } catch (err) {
    return err;
  }
}

export async function findClassTeacherByUsername(username) {
  try {
    const classTeacher = await teacherModel.findOne({ username });
    return classTeacher;
  } catch (err) {
    return err;
  }
}
export async function findClassTeacherByEmail(email) {
  try {
    const classTeacher = await teacherModel.findOne({ email });
    return classTeacher;
  } catch (err) {
    throw err;
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

export async function findClassTeacherById(id) {
  try {
    const classTeacher = await teacherModel.findById(id);
    return classTeacher;
  }catch(error){
    return error;
  }
}
export async function updateClassTeacherById({ 
  id,
  firstname,
  lastname,
  dob,
  phone,
  bloodGroup,
  gender,
  university,
  degree}){
    try {
      const teacher = await teacherModel.findByIdAndUpdate(id,{ 
        firstname,
        lastname,
        dob,
        phone,
        bloodGroup,
        gender,
        university,
        degree});
        return teacher;
              
    } catch (error) {
      throw error;
    }
  }

export async function deleteTeacher(id) {
  try {
    const teacher = await teacherModel.findByIdAndDelete(id);
    await sectionModel.updateMany(
      { classTeacher: id },
      { $unset: { classTeacher: 1 } }
    );
    return teacher;
  } catch (error) {
    return error;
  }
}

export async function getAllTeachers(adminId) {
  try {
    const teacherlist = await teacherModel.find({ admin: adminId });
    return teacherlist;
  } catch (error) {
    return error;
  }
}

export async function getAllClassTeachers(adminId) {
  try {
    const cordinatorlist = await teacherModel.find({ admin: adminId });
    return cordinatorlist;
  } catch (error) {
    return error;
  }
}

export async function getTeacherList({ adminId, limit, page }) {
  try {
    const teachers = await teacherModel
      .find({ admin: adminId })
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    return teachers;
  } catch (error) {
    return error;
  }
}

export async function getTeacherCount({ adminId }) {
  try {
    const teacherCount = await teacherModel.countDocuments({ admin: adminId });
    return teacherCount;
  } catch (error) {
    return error;
  }
}

export async function updateTeacherById(
  teacherId,
  {
    username,
    firstname,
    lastname,
    email,
    phone,
    bloodGroup,
    gender,
    university,
    degree,
    dob,
  }
) {
  try {
    const updatedTeacher = await teacherModel.findByIdAndUpdate(teacherId, {
      username,
      firstname,
      lastname,
      email,
      phone,
      bloodGroup,
      gender,
      university,
      degree,
      dob,
    });
    return updatedTeacher;
  } catch (error) {
    throw error;
  }
}
