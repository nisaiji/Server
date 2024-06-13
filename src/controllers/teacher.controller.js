import {
  checkTeacherExist,
  createTeacher,
  deleteTeacher,
  findClassTeacherByEmail,
  findClassTeacherById,
  findClassTeacherByUsername,
  findTeacherById,
  getAllClassTeachers,
  getAllTeachers,
  getTeacherCount,
  getTeacherList,
  updateClassTeacherById,
  updateTeacherById,
} from "../services/teacher.services.js";
import {
  checkPasswordMatch,
  hashPassword,
} from "../services/password.service.js";
import { error, success } from "../utills/responseWrapper.js";
import { findAdminByID } from "../services/admin.services.js";
import { generateAccessToken } from "../services/JWTToken.service.js";
import { findSectionByClassTeacherId } from "../services/section.services.js";
import { findClassById } from "../services/class.sevices.js";

export async function registerTeacherController(req, res) {
  try {
    // console.log("controller");
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
    const { email, password } = req.body;
    // const classTeacher = await findClassTeacherByUsername(username);
    const classTeacher = await findClassTeacherByEmail(email);
    // console.log(classTeacher);
    if (!classTeacher) {
      return res.send(error(404, "class teacher doesn't exist"));
    }
    const matchPassword = await checkPasswordMatch(
      password,
      classTeacher.password
    );
    // console.log(matchPassword)
    if (!matchPassword) {
      return res.send(error(404, "incorrect password"));
    }
    const section = await findSectionByClassTeacherId(classTeacher["_id"]);
    const Class = await findClassById(section["classId"]);
    const accessToken = generateAccessToken({
      role: "teacher",
      teacherId: classTeacher["_id"],
      adminId: classTeacher["admin"],
      phone: classTeacher["phone"],
      sectionId: section["_id"],
      classId: Class["_id"],
      sectionName: section["name"],
      className: Class["name"],
    });
    return res.send(
      success(200, { accessToken, username: classTeacher["username"] })
    );
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function updateClassTeacherController(req, res) {
  try {
    const teacherId = req.params.teacherId;
    const {
      firstname,
      lastname,
      dob,
      phone,
      bloodGroup,
      gender,
      university,
      degree,
    } = req.body;
    // const { email, password } = req.body;
    const classTeacher = await findClassTeacherById(teacherId);
    if (!classTeacher) {
      return res.send(error(400, "class teacher doesn't exists"));
    }
    console.log("ct", classTeacher);
    const updatedTeacher = await updateClassTeacherById({
      id: teacherId,
      firstname,
      lastname,
      dob,
      phone,
      bloodGroup,
      gender,
      university,
      degree,
    });
    console.log("up", updatedTeacher);
    return res.send(success(200, "class teacher updated successfully"));
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
    return res.send(
      success(200, "teacher marked as class Teacher successfully")
    );
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
    const adminId = req.adminId;
    const teacherList = await getAllTeachers({ adminId });
    return res.send(success(200, teacherList));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function getTeachersController(req, res) {
  try {
    const teacherId = req.params.teacherId;
    const teacher = await findTeacherById(teacherId);
    return res.send(success(200, teacher));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function getTeacherListController(req, res) {
  try {
    const pageNo = req.params.pageNo;
    const adminId = req.adminId;
    const limit = 5;
    const teacherCount = await getTeacherCount({ adminId });
    const teacherList = await getTeacherList({ adminId, limit, page: pageNo });
    return res.send(
      success(200, { pageNo, limit, totalCount: teacherCount, teacherList })
    );
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

export async function updateTeacherController(req, res) {
  try {
    const teacherId = req.params.teacherId;
    const {
      username,
      firstname,
      lastname,
      email,
      password,
      phone,
      bloodGroup,
      gender,
      university,
      degree,
      dob,
    } = req.body;
    const teacher = await findTeacherById(teacherId);
    if (!teacher) {
      return res.send(error(400, "can not find teacher"));
    }
    const updatedTeacher = await updateTeacherById(teacherId, {
      username,
      firstname,
      lastname,
      email,
      password,
      phone,
    });
    if (updatedTeacher instanceof Error) {
      return res.send(error(500, "can't update teacher"));
    }
    return res.send(success(200, "teacher updated successfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}
