import {
  checkTeacherExist,
  createTeacher,
  deleteTeacher,
  findTeacherById,
  findTeacherByUsername,
  getAllCordinators,
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
      phone
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

export async function loginTeacherController(req, res) {
  try {
    const { username, password } = req.body;

    const teacher = await findTeacherByUsername(username);
    if (!teacher) {
      return res.send(error(404, "teacher is not registered"));
    }
    const matchPassword = await checkPasswordMatch(password, teacher.password);
    if (!matchPassword) {
      return res.send(error(404, "incorrect password"));
    }
    const accessToken = generateAccessToken({
      teacherId: teacher["_id"],
      schoolId: teacher["school"],
      phone: teacher["phone"]
    });
    return res.send(success(200, { accessToken }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function markTeacherAsCordinatorController(req, res) {
  try {
    const teacherId = req.params.teacherId;
    const teacher = await findTeacherById(teacherId);
    if (!teacher) {
      return res.send(error(400, "teacher doesn't exists"));
    }
    teacher["isCoordinator"] = true;
    await teacher.save();
    return res.send(success(200, "teacher marked as cordinator successfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function deleteTeacherController(req, res) {
  try {
    const teacherId = req.params.teacherId;
    console.log({teacherId})
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

export async function getAllCordinatorsController(req, res) {
  try {
    const cordinatorlist = await getAllCordinators();
    return res.send(success(2001, cordinatorlist));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}
