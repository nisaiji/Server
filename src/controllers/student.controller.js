import { findAdminByID } from "../services/admin.services.js";
import { findClassById } from "../services/class.sevices.js";
import {
  checkStudentExistInSection,
  findSectionByClassTeacherId,
  findSectionById,
} from "../services/section.services.js";
import {
  adminRegisterStudent,
  checkStudentExist,
  deleteStudentById,
  findStudentById,
  getStudentList,
  registerStudent,
} from "../services/student.service.js";
import { findTeacherById } from "../services/teacher.services.js";
import { error, success } from "../utills/responseWrapper.js";

export async function registerStudentController(req, res) {
  try {
    const {
      rollNumber,
      firstname,
      lastname,
      gender,
      age,
      email,
      phone,
      address,
    } = req.body;
    const classTeacherId = req.classTeacherId;
    const classTeacher = await findTeacherById(classTeacherId);
    if (!classTeacher) {
      return res.send(error(400, "class teacher doesn't exists"));
    }
    const section = await findSectionByClassTeacherId(classTeacherId);
    if (!section) {
      return res.send(error(400, "section doesn't exists"));
    }
    const adminId = classTeacher?.admin;
    // console.log({classTeacher})
    const existingStudent = await checkStudentExist(rollNumber, adminId);
    if (existingStudent) {
      return res.send(error(400, "roll number already exist"));
    }
    const student = await registerStudent(
      rollNumber,
      firstname,
      lastname,
      gender,
      age,
      phone,
      email,
      address,
      adminId
    );
    section?.students?.push(student["_id"]);
    student.section = section["_id"];
    await section.save();
    await student.save();
    return res.send(success(201, "student created successfully!"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}
export async function adminRegisterStudentController(req, res) {
  try {
    const {
      rollNumber,
      firstname,
      lastname,
      gender,
      age,
      email,
      phone,
      address,
      sectionId,
      classId,
    } = req.body;
    const adminId = req.adminId;
    const admin = await findAdminByID(adminId);
    if (!admin) {
      return res.send(error(400, "admin doesn't exists"));
    }
    const section = await findSectionById(sectionId);
    if (!section) {
      return res.send(error(400, "section doesn't exists"));
    }
    const Class = await findClassById(classId);
    if (!Class) {
      return res.send(error(400, "Class doesn't exists"));
    }

    const existingStudent = await checkStudentExist(rollNumber, adminId);
    if (existingStudent) {
      return res.send(error(400, "roll number already exist"));
    }
    const student = await adminRegisterStudent({
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
    });
    section?.students?.push(student["_id"]);
    student.section = section["_id"];
    await section.save();
    await student.save();
    return res.send(success(201, "student created successfully!"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function addToSectionStudentController(req, res) {
  try {
    const studentId = req.params.studentId;
    const { sectionId } = req.body;
    const student = await findStudentById(studentId);
    if (!student) {
      return res.send(error(400, "student doesn't exists"));
    }
    const section = await findSectionById(sectionId);
    if (!section) {
      return res.send(error(400, "section doesn't exists"));
    }
    const isStudentExistInSection = checkStudentExistInSection(
      section.students,
      studentId
    );
    if (isStudentExistInSection) {
      return res.send(error(400, "student already exist in section"));
    }
    section?.students?.push(studentId);
    student.section = sectionId;
    await section.save();
    await student.save();

    return res.send(
      success(201, `${student.firstname} added to ${section.name} successfully`)
    );
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function deleteStudentController(req, res) {
  try {
    const studentId = req.params.studentId;
    const student = await deleteStudentById(studentId);
    if (!student) {
      return res.send(error(400, "student doesn't exists"));
    }
    return res.send(success(200, "student deleted successfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function getStudentListOfSection(req, res) {
  try {
    const sectionId = req.params.sectionId;
    const classTeacherId = req.classTeacherId;
    const pageNo = req.params.pageNo;
    const limit = 5;
    const section = await findSectionById(sectionId);
    if (section["classTeacher"] !== classTeacherId) {
      return res.send(
        error(400, "this class teacher doesn't has access to this section.")
      );
    }
    const studentList = await getStudentList({
      limit,
      page: pageNo,
      sectionId,
    });
    return studentList;
  } catch (err) {
    return res.send(error(500, err.message));
  }
}
