import { StatusCodes } from "http-status-codes";
import { getAdminService } from "../services/admin.services.js";
import {  getAttendanceService } from "../services/attendance.service.js";
import { getClassService } from "../services/class.sevices.js";
import {checkParentExist,diActivateParentByIdService,findParentById,getParentService,registerParent,updateInfoParent,updateParentInfo, updateParentService} from "../services/parent.services.js";
import { hashPasswordService } from "../services/password.service.js";
import {
    findSectionById, getSectionService
} from "../services/section.services.js";
import {
  checkPhoneAlreadyExists,
  diActivateStudentByIdService,
  getStudentService,
  getAllStudentCount,
  getAllStudentList,
  getStudentList,
  getStudentListBySectionId,
  registerStudent,
  searchStudentByName,
  searchStudentByNameForAdmin, 
  studentCountOfSectionService,
  updateStudent,
  updateStudentByParent,
  updateStudentInfo,
  uploadStudentPhoto,
  registerStudentService,
  updateStudentService
} from "../services/student.service.js";
import { getTeacherService } from "../services/teacher.services.js";
import { error, success } from "../utills/responseWrapper.js";

export async function registerStudentController(req, res) {
  try {
    const {firstname, lastname, gender, parentName, phone, sectionId, classId } = req.body;
    const teacherId = req.teacherId;
    const adminId = req.adminId;

    const [section, classInfo] = await Promise.all([getSectionService({_id:sectionId}), getClassService({_id:classId})]);
    if(!section){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Section not found"));
    }
    if(!classInfo){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Class not found"));
    }

 
    const parentNames = parentName.split(" ");
    const password = parentNames[0] + "@" + phone;
    const hashedPassword = await hashPasswordService(password);
    let parent = await getParentService({ phone });
    if (!parent) {
      parent = await registerParent({ fullname: parentName, phone, password: hashedPassword, admin: adminId });
    }
   

    let student = await getStudentService({ firstname, parent: parent["_id"] });
    if (student) {
      return res.status(StatusCodes.CONFLICT).send(error(400, "Student already exists"));
    }
    const studentObj = {firstname, lastname, gender, parent:parent["_id"], section:sectionId, classId, admin:adminId};
    student = await registerStudentService(studentObj);
 
    return res.status(StatusCodes.OK).send(success(201, "Student created successfully!"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function adminRegisterStudentController(req, res) {
  try {
    const {firstname, lastname, gender, parentName, phone, sectionId, classId } = req.body;
    const adminId = req.adminId;

    const [section, classInfo] = await Promise.all([getSectionService({_id:sectionId}), getClassService({_id:classId})]);
    if(!section){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Section not found"));
    }
    if(!classInfo){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Class not found"));
    }

 
    const parentNames = parentName.split(" ");
    const password = parentNames[0] + "@" + phone;
    const hashedPassword = await hashPasswordService(password);
    let parent = await getParentService({ phone });
    if (!parent) {
      parent = await registerParent({ fullname: parentName, phone, password: hashedPassword, admin: adminId });
    }
   

    let student = await getStudentService({ firstname, parent: parent["_id"] });
    if (student) {
      return res.status(StatusCodes.CONFLICT).send(error(400, "Student already exists"));
    }
    const studentObj = {firstname, lastname, gender, parent:parent["_id"], section:sectionId, classId, admin:adminId};
    student = await registerStudentService(studentObj);
 
    return res.status(StatusCodes.OK).send(success(201, "Student created successfully!"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function deleteStudentController(req, res) {
  try {
    const studentId = req.params.studentId;
    const[student, parent] = await Promise.all([getStudentService({ _id: studentId, isActive:true }), getParentService({_id:student["parent"], isActive:true})])
    if (!student) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Student doesn't exists"));
    }
    if (!parent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Parent doesn't exists"));
    }
    
    await updateStudentService({_id:studentId}, {isActive:false});

    const siblings = await getStudentService({parent:student["parent"], isActive:true});
    if (siblings?.length === 0) {
      await updateParentService({_id:student["parent"]}, {isActive:false});
    }
    return res.status(StatusCodes.OK).send(success(200, "Student deleted successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getSectionStudentController(req, res){
  try {
    const{section, limit, page} = req.body;
    const students = await getStudentsService({section},{}, limit, page);
    return res.status(StatusCodes.OK).send(success(200, {students}));
    
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}


export async function getStudentListOfSectionController(req, res) {
  try {
    const sectionId = req.params.sectionId;
    const classTeacherId = req.teacherId;
    const pageNo = req.params.pageNo;
    const limit = 5;
    const studentCount = await studentCountOfSectionService({ sectionId });
    const section = await findSectionById(sectionId);
    if (section["classTeacher"].toString() !== classTeacherId) {
      return res.send(
        error(400, "This class teacher doesn't has access to this section.")
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
    const section = await findSectionById(sectionId);
    const studentCount = section["studentCount"];

    if (section["teacher"].toString() !== classTeacherId) {
      return res.send(
        error(400, "This class teacher doesn't has access to this section.")
      );
    }
    const studentList = await getStudentListBySectionId({ sectionId });
    return res.send(success(200, { totalCount: studentCount, studentList }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function getAllStudentOfSectionForAdminController(req, res) {
  try {
    const sectionId = req.params.sectionId;
    const adminId = req.adminId;
    const studentCount = await studentCountOfSectionService({ sectionId });
    const section = await findSectionById(sectionId);
    if (section["admin"].toString() !== adminId) {
      return res.send(
        error(400, "This class teacher doesn't has access to this section.")
      );
    }
    const studentList = await getStudentListBySectionId({ sectionId });
    return res.send(success(200, { totalCount: studentCount, studentList }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function getAllStudentListForAdminController(req, res) {
  try {
    const adminId = req.adminId;
    const pageNo = req.params.pageNo;
    const limit = 10;
    const studentCount = await getAllStudentCount({ adminId });
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
    const admin = await getAdminService({_id:adminId, isActive:true});
    if (!admin) {
      return res.send(error(400, "admin doesn't exists"));
    }
    const student = await getStudentService({_id:studentId, isActive:true});
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
    const student = await getStudentService({ _id: studentId, isActive:true });
    if (!student) {
      return res.send(error(400, "Student doesn't exists"));
    }
    const parentId = student["parent"];
    const parent = await findParentById({ id: parentId });

    if (!parent) {
      return res.send(error(400, "Parent doesn't exists"));
    }

    const parentWithDuplicatePhone = await checkPhoneAlreadyExists({
      parentId: parent["_id"],
      phone
    });
    if (parentWithDuplicatePhone) {
      return res.send(error(400, "Phone number already in use"));
    }
    const updatedStudent = await updateStudent({
      studentId,
      firstname,
      lastname,
      gender
    });
    if (updatedStudent instanceof Error) {
      return res.send(error(400, "Can't update student Info"));
    }
    const updatedParent = await updateInfoParent({
      parentId,
      fullname: parentName,
      phone
    });

    if (updatedParent instanceof Error) {
      return res.send(error(400, "Can't update parent Info"));
    }
    return res.send(success(201, "Student updated successfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function parentUpdateStudentController(req, res) {
  try {
    const { bloodGroup, dob, address } = req.body;
    const studentId = req.params.studentId;
    const parentId = req.parentId;
    const student = await getStudentService({ _id: studentId, isActive:true });
    if (!student) {
      return res.send(error(400, "Student doesn't exists"));
    }
    if (student["parent"].toString() !== parentId) {
      return res.send(error(400, "Can't update,parent student mis-match"));
    }

    const updatedStudent = await updateStudentByParent({
      id: studentId,
      bloodGroup,
      dob,
      address
    });
    if (updatedStudent instanceof Error) {
      return res.send(error(400, "Student can't updated"));
    }

    return res.send(success(200, "Student updated successfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function studentParentUpdateStudentController(req, res) {
  try {
    const {
      firstname,
      lastname,
      gender,
      bloodGroup,
      dob,
      address,
      parentFullname,
      parentGender,
      parentAge,
      parentEmail,
      parentPhone,
      parentQualification,
      parentOccupation,
      parentAddress
    } = req.body;

    const studentId = req.params.studentId;
    const student = await getStudentService({ _id: studentId, isActive:true });
    if (!student) {
      return res.send(error(400, "Student doesn't exists"));
    }

    const parent = await findParentById({ id: student["parent"] });
    if (!parent) {
      return res.send(error(400, "Parent doesn't found"));
    }

    const updatedStudent = await updateStudentInfo({
      id: student["_id"],
      firstname,
      lastname,
      gender,
      bloodGroup,
      dob,
      address
    });
    if (updatedStudent instanceof Error) {
      return res.send(error(400, "Student can't updated"));
    }

    const updatedParent = await updateParentInfo({
      id: student["parent"],
      fullname: parentFullname,
      gender: parentGender,
      age: parentAge,
      email: parentEmail,
      phone: parentPhone,
      qualification: parentQualification,
      occupation: parentOccupation,
      address: parentAddress
    });
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
    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0,
      0
    ).getTime();
    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999
    ).getTime();

    if (!sectionId) {
      return res.send(error(400, "Section id is required"));
    }

    const section = await findSectionById(sectionId);
    if (!section) {
      return res.status(400).send({ error: "Section does not exist" });
    }

    const students = await searchStudentByName({ name, sectionId });

    if (students instanceof Error) {
      return res.status(400).send({ error: "Can't search students" });
    }

    const studentWithAttendance = await Promise.all(
      students.map(async (student) => {
        const attendance = await getAttendanceService({student: student["_id"],date:{$gte:startOfDay, $lte:endOfDay}});
        return { ...student.toObject(), attendance };
      })
    );

    return res.send(success(200, studentWithAttendance));
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
}

export async function searchStudentForAdminController(req, res) {
  try {
    const name = req.params.name;
    const adminId = req.adminId;
    const students = await searchStudentByNameForAdmin({ name, adminId });
    if (students instanceof Error) {
      return res.status(400).send({ error: "Can't search students" });
    }
    return res.send(success(200, students));
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
}

export async function uploadStudentPhotoController(req, res) {
  try {
    const { photo } = req.body;
    const parentId = req.parentId;
    const studentId = req.params.studentId;

    if (!photo) {
      return res.send(error(400, "Photo is required"));
    }

    const student = await getStudentService({ _id: studentId, isActive:true });
    if (!student) {
      return res.send(error(400, "Student not found"));
    }

    if (student["parent"].toString() !== parentId) {
      return res.send("Unauthorized user for photo upload");
    }

    const updatedStudent = await uploadStudentPhoto({ studentId, photo });
    if (updatedStudent instanceof Error) {
      return res.send(error(400, "Photo not uploaded."));
    }
    return res.send(success(200, "Photo uploaded successfully"));
  } catch (err) {
    res.send(error(500, err.message));
  }
}
