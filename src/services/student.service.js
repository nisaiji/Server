import studentModel from "../models/student.model.js";

export async function checkStudentExist(rollNumber, admin) {
  try {
    const student = await studentModel.findOne({
      $and: [{ rollNumber }, { admin }],
    });
    return student;
  } catch (error) {
    return student;
  }
}

export async function registerStudent(
  rollNumber,
  firstname,
  lastname,
  gender,
  age,
  phone,
  email,
  address,
  admin
) {
  try {
    const student = await studentModel.create({
      rollNumber,
      firstname,
      lastname,
      gender,
      age,
      phone,
      email,
      address,
      admin,
    });
    return student;
  } catch (error) {
    return error;
  }
}
export async function adminRegisterStudent({
  rollNumber,
  firstname,
  lastname,
  gender,
  age,
  phone,
  email,
  address,
  sectionId,
  classId,
  adminId,
}) {
  try {
    const student = await studentModel.create({
      rollNumber,
      firstname,
      lastname,
      gender,
      age,
      phone,
      email,
      address,
      admin: adminId,
      section: sectionId,
      classId,
    });
    return student;
  } catch (error) {
    return error;
  }
}

export async function findStudentById(_id) {
  try {
    const student = await studentModel.findById({ _id });
    return student;
  } catch (error) {
    return error;
  }
}

export async function deleteStudentById(id) {
  try {
    const student = await studentModel.findByIdAndDelete(id);
    // console.log(student);
    return student;
  } catch (error) {
    return error;
  }
}

export async function getStudentList({ limit, page, sectionId }) {
  try {
    const students = await studentModel
      .find({ section: sectionId })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    return students;
  } catch (error) {
    return error;
  }
}
