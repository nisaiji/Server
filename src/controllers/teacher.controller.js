import {
  checkTeacherExist,
  createTeacher,
  deleteTeacher,
  findClassTeacherByUsername,
  findTeacherById,
  getAllClassTeachers,
  getAllTeachers
} from "../services/teacher.services.js";
import generateAccessToken from "../services/accessToken.service.js";
import {
  checkPasswordMatch,
  hashPassword
} from "../services/password.service.js";
import { error, success } from "../utills/responseWrapper.js";
import { findAdminByID } from "../services/admin.services.js";

export async function registerTeacherController(req, res) {
  try {
    const adminId = req.adminId;
    const { username, firstname, lastname, email, password, phone } = req.body;
    const existingTeacher = await checkTeacherExist(username, email);

    if (existingTeacher && existingTeacher?.username === username) {
      return res.send(error(400, "username name already exist"));
    }
    if (existingTeacher && existingTeacher?.email === email) {
      return res.send(error(400, "email already exist"));
    }
    const hashedPassword = await hashPassword(password);
    const teacher = await createTeacher(
      username,
      firstname,
      lastname,
      email,
      hashedPassword,
      phone,
      adminId
    );
    const admin = await findAdminByID(adminId);
    // console.log({ admin });
    admin.teachers.push(teacher["_id"]);
    await admin.save();
    teacher.school = admin["_id"];
    await teacher.save();
    return res.send(success(201, "teacher created successfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function loginClassTeacherController(req, res) {
  try {
    const { username, password } = req.body;

    const classTeacher = await findClassTeacherByUsername(username);
    // console.log(classTeacher);
    if (!classTeacher) {
      return res.send(error(404, "class teacher doesn't exist"));
    }
    const matchPassword = await checkPasswordMatch(password, classTeacher.password);
    if (!matchPassword) {
      return res.send(error(404, "incorrect password"));
    }
    const accessToken = generateAccessToken({
      classTeacherId: classTeacher["_id"],
      schoolId: classTeacher["school"],
      phone: classTeacher["phone"]
    });
    return res.send(success(200, { accessToken }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function markTeacherAsClassTeacherController(req, res) {
  try {
    const teacherId = req.params.teacherId;
    const teacher = await findTeacherById(teacherId);
    if (!teacher) {
      return res.send(error(400, "teacher doesn't exists"));
    }
    teacher["isClassTeacher"] = true;
    await teacher.save();
    return res.send(success(200, "teacher marked as class Teacher successfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function deleteTeacherController(req, res) {
  try {
    const teacherId = req.params.teacherId;
    // console.log({teacherId})
    const teacher = await deleteTeacher(teacherId);
    if (!teacher) {
      return res.send(error(400, "can not find teacher"));
    }
    return res.send(success(200, "teacher deleted successfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function getAllTeachersController(req, res) {
  try {
    const teacherList = await getAllTeachers();
    return res.send(success(200, teacherList));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function getAllClassTeachersController(req, res) {
  try {
    const classTeacherList = await getAllClassTeachers();
    return res.send(success(2001, classTeacherList));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}