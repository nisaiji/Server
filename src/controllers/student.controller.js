import { findAdminByID } from "../services/admin.services.js";
import {findAttendanceById,findAttendanceByStudentId,getAttendaceByStudentId} from "../services/attendance.service.js";
import { findClassById } from "../services/class.sevices.js";
import {checkParentExist,deleteParentById,findParentById,registerParent,updateInfoParent,updateParent, updateParentInfo} from "../services/parent.services.js";
import { hashPassword } from "../services/password.service.js";
import {checkStudentExistInSection,findSectionByClassTeacherId,findSectionById} from "../services/section.services.js";
import {adminRegisterStudent,adminUpdateStudent,checkStudentExist,deleteStudentById,findStudentById,findStudentSiblings,getAllStudentCount,
        getAllStudentList,getStudentCount,getStudentList,getStudentListBySectionId,registerStudent,searchStudentByName,searchStudentByNameForAdmin,updateStudent,updateStudentByParent, updateStudentInfo} from "../services/student.service.js";
import {findClassTeacherById,findTeacherById} from "../services/teacher.services.js";
import { error, success } from "../utills/responseWrapper.js";

export async function registerStudentController(req, res) {
  try {
    const {rollNumber,firstname,lastname,gender,parentName,phone,sectionId,classId} = req.body;
    const teacherId = req.teacherId;
    const adminId = req.adminId;
    const teacher = await findTeacherById(teacherId);
    if (!teacher) {
      return res.send(error(400, "teacher doesn't exists"));
    }
    const section = await findSectionById(sectionId);
    if (!section) {
      return res.send(error(400, "section doesn't exists"));
    }
    const Class = await findClassById(classId);
    if (!Class) {
      return res.send(error(400, "Class doesn't exists"));
    }
    const gardianName = parentName.split(" ");
    const password = gardianName[0]+"@" + phone;
    const hashedPassword = await hashPassword(password);
    let parent = await checkParentExist({ phone });
    if (!parent) {
      console.log({ hashedPassword });
      parent = await registerParent({
        fullname: parentName,
        phone,
        password: hashedPassword,
        admin: adminId
      });
    }
    if (!parent) {
      return res.send(error(400, "can't register/find parent"));
    }

    const existingStudent = await checkStudentExist({
      firstname,
      parentId: parent["_id"]
    });
    if (existingStudent) {
      return res.send(error(400, "student already exists"));
    }
    const student = await registerStudent({
      rollNumber,
      firstname,
      lastname,
      gender,
      parentId: parent["_id"],
      sectionId,
      classId,
      adminId
    });
    if (student instanceof Error) {
      return res.send(error(400, "can't register student"));
    }
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
      parentName,
      phone,
      sectionId,
      classId
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

    const gardianName = parentName.split(" ");
    const password = gardianName[0]+"@" + phone;
    const hashedPassword = await hashPassword(password);
    let parent = await checkParentExist({ phone });

    if (!parent) {
      parent = await registerParent({
        fullname: parentName,
        phone,
        password: hashedPassword,
        admin: adminId
      });
    }
    if (!parent) {
      return res.send(error(400, "can't register/find parent"));
    }

    const existingStudent = await checkStudentExist({
      firstname,
      parentId: parent["_id"]
    });
    console.log(existingStudent);
    if (existingStudent) {
      return res.send(error(400, "student already exists"));
    }
    const student = await registerStudent({
      rollNumber,
      firstname,
      lastname,
      gender,
      parentId: parent["_id"],
      sectionId,
      classId,
      adminId
    });
    if (student instanceof Error) {
      return res.send(error(400, "can't register student"));
    }
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
    const student = await findStudentById(studentId);
    if (!student) {
      return res.send(error(400, "student doesn't exists"));
    }
    const parentId = student["parent"];
    const parent = await findParentById(parentId);
    if (!parent) {
      return res.send(error(400, "parent doesn't exists"));
    }
    const deletedStudent = await deleteStudentById(studentId);

    const siblings = await findStudentSiblings(parentId);
    console.log({ siblings });
    if (siblings.length === 0) {
      const deletedParent = await deleteParentById(parentId);
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
      sectionId
    });
    return res.send(
      success(200, { pageNo, limit, totalCount: studentCount, studentList })
    );
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function getAllStudentOfSectionController(req, res) {
  try {
    const sectionId = req.params.sectionId;
    const classTeacherId = req.teacherId;
    const studentCount = await getStudentCount({ sectionId });
    const section = await findSectionById(sectionId);
    if (section["classTeacher"].toString() !== classTeacherId) {
      return res.send(
        error(400, "this class teacher doesn't has access to this section.")
      );
    }
    const studentList = await getStudentListBySectionId({
      sectionId
    });
    return res.send(success(200, { totalCount: studentCount, studentList }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function getAllStudentOfSectionForAdminController(req, res) {
  try {
    const sectionId = req.params.sectionId;
    const adminId = req.adminId;
    const studentCount = await getStudentCount({ sectionId });
    const section = await findSectionById(sectionId);
    if (section["admin"].toString() !== adminId) {
      return res.send(
        error(400, "this class teacher doesn't has access to this section.")
      );
    }
    const studentList = await getStudentListBySectionId({
      sectionId
    });
    return res.send(success(200, { totalCount: studentCount, studentList }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function getAllStudentListForAdminController(req, res) {
  try {
    const adminId = req.adminId;
    const pageNo = req.params.pageNo;
    const limit = 5;
    const studentCount = await getAllStudentCount(adminId);
    const studentList = await getAllStudentList({
      adminId,
      limit,
      page: pageNo
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
      firstname,
      lastname,
      gender,
      parentName,
      phone,
      sectionId,
      classId
    } = req.body;
    const studentId = req.params.studentId;
    const adminId = req.adminId;
    const admin = await findAdminByID(adminId);
    if (!admin) {
      return res.send(error(400, "admin doesn't exists"));
    }
    const student = await findStudentById(studentId);
    if (!student) {
      return res.send(error(400, "student doesn't exists"));
    }
    const parent = await findParentById(student["parentId"]);
    if (!parent) {
      return res.send(error(400, "parent doesn't exists"));
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
      address
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
    const { firstname, lastname, gender, parentName, phone } = req.body;
    const studentId = req.params.studentId;
    const student = await findStudentById(studentId);
    if (!student) {
      return res.send(error(400, "student doesn't exists"));
    }
    const parentId = student["parent"];
    const parent = await findParentById(parentId);

    if (!parent) {
      return res.send(error(400, "parent doesn't exists"));
    }
    const updatedStudent = await updateStudent({
      studentId,
      firstname,
      lastname,
      gender
    });
    if (updatedStudent instanceof Error) {
      return res.send(error(400, "can't update student Info."));
    }
    const updatedParent = await updateInfoParent({
      parentId,
      fullname: parentName,
      phone
    });
    console.log(updatedParent);
    if (updatedParent instanceof Error) {
      return res.send(error(400, "can't update parent Info."));
    }
    return res.send(success(201, "student updated successfully!"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function parentUpdateStudentController(req, res) {
  try {
    const { bloodGroup, dob, address } = req.body;
    const studentId = req.params.studentId;
    const parentId = req.parentId;
    const student = await findStudentById(studentId);
    if (!student) {
      return res.send(error(400, "student doesn't exists"));
    }
    if (student["parent"].toString() !== parentId) {
      return res.send(error(400, "can't update,parent student mis-match"));
    }

    const updatedStudent = await updateStudentByParent({
      studentId,
      bloodGroup,
      dob,
      address
    });
    if (updatedStudent instanceof Error) {
      return res.send(error(400, "student can't updated"));
    }

    return res.send(success(200, "student updated successfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function studentParentUpdateStudentController(req, res) {
  try {
    const { rollNumber,firstname,lastname,gender,bloodGroup,dob,address,
      parentFullname,parentGender,parentAge,parentEmail,parentPhone,
      parentQualification,parentOccupation,parentAddress } = req.body;

    const studentId = req.params.studentId;
    const student = await findStudentById(studentId);
    if (!student) {
      return res.send(error(400, "Student doesn't exists"));
    }
    
    const parent = await findParentById(student["parent"]);
    if(!parent){
      return res.send(error(400,"Parent doesn't found"));
    }

    const updatedStudent = await updateStudentInfo({id:student["_id"],rollNumber,firstname,lastname,gender,bloodGroup,dob,address});
    if (updatedStudent instanceof Error) {
      return res.send(error(400, "Student can't updated"));
    }

    const updatedParent = await updateParentInfo({id:student["parent"],fullname:parentFullname,gender:parentGender,age:parentAge,email:parentEmail,phone:parentPhone,qualification:parentQualification,occupation:parentOccupation,address:parentAddress});
    if (updatedParent instanceof Error) {
      return res.send(error(400, "Teacher can't updated"));
    }

    return res.send(success(200, "Student and Parent updated successfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function searchStudentOfSectionController(req, res) {
  try {
    const name = req.params.name;
    const sectionId = req.sectionId;
    const date = new Date();
    const currDate = date.getTime();
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();

    if (!sectionId) {
      return res.send(error(400,"section id is required"));
    }

    const section = await findSectionById(sectionId);
    if (!section) {
      return res.status(400).send({ error: "section does not exist" });
    }

    
    const students = await searchStudentByName({ name, sectionId });

    if (students instanceof Error) {
      return res.status(400).send({ error: "can't search students" });
    }

    const studentWithAttendance = await Promise.all(
      students.map(async (student) => {
        const attendance = await findAttendanceByStudentId({ studentId: student["_id"], startOfDay, endOfDay });
        return { ...student.toObject(), attendance };
      })
    );
    
    


    return res.send(success(200,studentWithAttendance));
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
}

export async function searchStudentForAdminController(req, res) {
  try {
    const name = req.params.name;
    const adminId = req.adminId;
    const students = await searchStudentByNameForAdmin({ name,adminId });
    if (students instanceof Error) {
      return res.status(400).send({ error: "can't search students" });
    }
    return res.send(success(200, students));
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
}

export async function getMonthlyAttendanceCountController(req,res){
  try {
    const studentId = req.params.studentId;
    
    
  } catch (err) {
    return res.send(error(500,err.message));
  }
}