import { findAdminByID } from "../services/admin.services.js";
import { findClassById } from "../services/class.sevices.js";
import {
  checkStudentExistInSection,
  findSectionByClassTeacherId,
  findSectionById,
} from "../services/section.services.js";
import {
  adminRegisterStudent,
  adminUpdateStudent,
  checkStudentExist,
  deleteStudentById,
  findStudentById,
  getStudentCount,
  getStudentList,
  registerStudent,
  updateStudent,
} from "../services/student.service.js";
import {
  findClassTeacherById,
  findTeacherById,
} from "../services/teacher.services.js";
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
    const classTeacherId = req.teacherId;
    const classTeacher = await findTeacherById(classTeacherId);
    if (!classTeacher) {
      return res.send(error(400, "class teacher doesn't exists"));
    }
    const section = await findSectionByClassTeacherId(classTeacherId);
    if (!section) {
      return res.send(error(400, "section doesn't exists"));
    }
    const adminId = classTeacher?.admin;
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
    return res.send(success(201, "student created successfully! by teacher"));
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

export async function getStudentListOfSectionController(req, res) {
  try {
    const sectionId = req.params.sectionId;
    const classTeacherId = req.teacherId;
    const pageNo = req.params.pageNo;
    const limit = 5;
    const studentCount = await getStudentCount({ sectionId });
    const section = await findSectionById(sectionId);
    if (section["classTeacher"].toString() !== classTeacherId) {
      return res.send(
        error(400, "this class teacher doesn't has access to this section.")
      );
    }
    const studentList = await getStudentList({
      limit,
      page: pageNo,
      sectionId,
    });
    return res.send(
      success(200, { pageNo, limit, totalCount: studentCount, studentList })
    );
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function getStudentListOfSectionForAdminController(req, res) {
  try {
    const sectionId = req.params.sectionId;
    const adminId = req.adminId;
    const pageNo = req.params.pageNo;
    const limit = 5;
    const studentCount = await getStudentCount({ sectionId });
    const section = await findSectionById(sectionId);
    if (!section) {
      return res.send(error(400, "section doesn't exist"));
    }
    if (section["admin"].toString() !== adminId) {
      return res.send(
        error(400, "this Admin doesn't has access to this section.")
      );
    }
    const studentList = await getStudentList({
      limit,
      page: pageNo,
      sectionId,
    });
    return res.send(
      success(200, { pageNo, limit, totalCount: studentCount, studentList })
    );
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function adminUpdateStudentController(req, res) {
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
    const studentId = req.params.studentId;
    const adminId = req.adminId;
    const admin = await findAdminByID(adminId);
    if (!admin) {
      return res.send(error(400, "admin doesn't exists"));
    }
    const studentexist = await findStudentById(studentId);
    if (!studentexist) {
      return res.send(error(400, "student doesn't exists"));
    }
    const updatedStudent = await adminUpdateStudent({
      studentId,
      rollNumber,
      firstname,
      lastname,
      gender,
      age,
      phone,
      email,
      address,
    });
    if (updatedStudent instanceof Error) {
      return res.send(error(400, "can't update student."));
    }
    return res.send(success(201, "student updated successfully!"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function updateStudentController(req, res) {
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
    const studentId = req.params.studentId;
    const classTeacherId = req.teacherId;
    const teacher = await findClassTeacherById(classTeacherId);
    if (!teacher) {
      return res.send(error(400, "class teacher doesn't exists"));
    }
    const studentexist = await findStudentById(studentId);
    if (!studentexist) {
      return res.send(error(400, "student doesn't exists"));
    }
    const updatedStudent = await updateStudent({
      studentId,
      rollNumber,
      firstname,
      lastname,
      gender,
      age,
      phone,
      email,
      address,
    });
    if (updatedStudent instanceof Error) {
      return res.send(error(400, "can't update student."));
    }
    return res.send(success(201, "student updated successfully!"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}
