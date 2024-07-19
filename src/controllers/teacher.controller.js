import {
  checkPhoneExists,
  checkTeacherExist,
  createTeacher,
  deleteTeacher,
  findClassTeacherByEmail,
  findClassTeacherById,
  findClassTeacherByUsername,
  findTeacherById,
  findTeacher,
  getAllClassTeachers,
  getAllTeachers,
  getNonClassTeachers,
  getTeacherCount,
  getTeacherList,
  updateClassTeacherById,
  updateTeacherById,
  updateAuthTeacher,
  updateProfileTeacher,
  updateAuthInfoTeacher,
  checkTeacherIsClassTeacher
} from "../services/teacher.services.js";
import {
  checkPasswordMatch,
  hashPassword
} from "../services/password.service.js";
import { error, success } from "../utills/responseWrapper.js";
import { findAdminByID } from "../services/admin.services.js";
import { generateAccessToken } from "../services/JWTToken.service.js";
import { findSectionByClassTeacherId } from "../services/section.services.js";
import { findClassById } from "../services/class.sevices.js";

export async function registerTeacherController(req, res) {
  try {
    const adminId = req.adminId;
    const { firstname, lastname, phone } = req.body;
    const existingTeacher = await checkPhoneExists({ phone });
    if (existingTeacher) {
      return res.send(error(400, "phone number already registered"));
    }
    const password = firstname+"@"+ phone;
    const hashedPassword = await hashPassword(password);
    const teacher = await createTeacher({
      firstname,
      lastname,
      hashedPassword,
      phone,
      adminId
    });
    await teacher.save();
    return res.send(success(201, "teacher created successfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function loginClassTeacherController(req, res) {
  try {
    const { user, password } = req.body;
    const classTeacher = await findTeacher({ user });
    if (!classTeacher) {
      return res.send(error(404, "unauthorized user"));
    }
    const matchPassword = await checkPasswordMatch(
      password,
      classTeacher.password
    );

    if (!matchPassword) {
      return res.send(error(404, "unauthorized  user"));
    }
    const section = await findSectionByClassTeacherId(classTeacher["_id"]);
    if (!section) {
      return res.send(error(400, "teacher is not assigned to any section"));
    }
    const Class = await findClassById(section["classId"]);
    const teacherEmail = classTeacher["email"]?classTeacher["email"]:"abc@gmail.com"
    const accessToken = generateAccessToken({
      role: "teacher",
      teacherId: classTeacher["_id"],
      adminId: classTeacher["admin"],
      phone: classTeacher["phone"],
      sectionId: section["_id"],
      classId: Class["_id"],
      sectionName: section["name"],
      className: Class["name"],
      email:teacherEmail
    });
    const isLoginAlready = classTeacher["isLoginAlready"];
    classTeacher["isLoginAlready"] = true;
    await classTeacher.save();
    return res.send(
      success(200, { accessToken, firstname: classTeacher["firstname"] ,isLoginAlready})
    );
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function authUpdateTeacherController(req, res) {
  try {
    const { username, password } = req.body;
    const teacherId = req.teacherId;
    const teacher = await findTeacherById(teacherId);
    if (!teacher) {
      return res.send(error(400, "teacher doesn't exists"));
    }
    const hashedPassword = await hashPassword(password);
    const updatedTeacher = await updateAuthTeacher({
      id: teacherId,
      username,
      password: hashedPassword
    });
    if (updatedTeacher instanceof Error) {
      return res.send(error(400, "details cann't be updated"));
    }
    return res.send(success(200, "teacher updated successfully"));
  } catch (err) {
    return re.send(error(500, err.message));
  }
}

export async function authInfoUpdateTeacherController(req, res) {
  try {
    const { email, phone } = req.body;
    const teacherId = req.teacherId;
    const teacher = await findTeacherById(teacherId);
    if (!teacher) {
      return res.send(error(400, "teacher doesn't exists"));
    }
    const updatedTeacher = await updateAuthInfoTeacher({
      id: teacherId,
      email,
      phone
    });
    if (updatedTeacher instanceof Error) {
      return res.send(error(400, "details cann't be updated"));
    }
    return res.send(success(200, "teacher updated successfully"));
  } catch (err) {
    return re.send(error(500, err.message));
  }
}

// firstname, lastname,phone, dob,bloodGroup,gender,university,degree
export async function profileUpdateTeacherController(req, res) {
  try {
    const {
      firstname,
      lastname,
      phone,
      dob,
      bloodGroup,
      gender,
      university,
      degree,
    } = req.body;
    const teacherId = req.teacherId;
    const teacher = await findTeacherById(teacherId);
    if (!teacher) {
      return res.send(error(400, "teacher doesn't exists"));
    }
    // const hashedPassword = await hashPassword(password);

    const updatedTeacher = await updateProfileTeacher({
      id: teacherId,
      firstname,
      lastname,
      phone,
      dob,
      bloodGroup,
      gender,
      university,
      degree,
    });
    if (updateAuthTeacher instanceof Error) {
      return res.send(error(400, "details cann't be updated"));
    }
    return res.send(success(200, "teacher updated successfully"));
  } catch (err) {
    return re.send(error(500, err.message));
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
      degree
    } = req.body;
    let {address} = req.body;
    const classTeacher = await findClassTeacherById(teacherId);
    if (!classTeacher) {
      return res.send(error(400, "class teacher doesn't exists"));
    }
    if(!address){
      address = classTeacher["address"]?classTeacher["address"]:"";
    }
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
      address
    });
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
    const isClassTeacher = await checkTeacherIsClassTeacher({teacherId});
    if(isClassTeacher){
      return res.send(error(400,"Teacher is assigned to section. Can't delete teacher"));
    }
    const teacher = await deleteTeacher(teacherId);
    if (!teacher) {
      return res.send(error(400, "can not find teacher"));
    }
    return res.send(success(200, "teacher deleted successfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

// export async function getAllTeachersController(req, res) {
//   try {
//     console.log("get all teachers");
//     const adminId = req.adminId;
//     const teacherList = await getAllTeachers({ adminId });
//     return res.send(success(200, {teacherList}));
//   } catch (err) {
//     return res.send(error(500, err.message));
//   }
// }

export async function getUnassignedTeacherController(req, res) {
  try {
    const adminId = req.adminId;
    const teacherList = await getNonClassTeachers(adminId);
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
    const adminId = req.adminId;
    const teacherList = await getTeacherList({ adminId });
    return res.send(success(200, { teacherList }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function getAllClassTeachersController(req, res) {
  try {
    console.log("teacher api called");
    const adminId = req.adminId;
    const classTeacherList = await getAllClassTeachers(adminId);
    return res.send(success(200, classTeacherList));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function updateTeacherController(req, res) {
  try {
    const teacherId = req.params.teacherId;
    const { firstname, lastname, phone } = req.body;
    const teacher = await findTeacherById(teacherId);
    if (!teacher) {
      return res.send(error(400, "can not find teacher"));
    }
    const updatedTeacher = await updateTeacherById(teacherId, {
      firstname,
      lastname,
      phone
    });
    if (updatedTeacher instanceof Error) {
      return res.send(error(500, "can't update teacher"));
    }
    return res.send(success(200, "teacher updated successfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function changePasswordTeacherController(req,res){
  try {
    const {oldPassword , newPassword} = req.body;
    const teacherId = req.teacherId;
    const teacher = await findTeacherById(teacherId);
    if (!teacher) {
      return res.send(error(404, "unauthorized user"));
    }
    const matchPassword = await checkPasswordMatch(oldPassword, teacher.password);
    if (!matchPassword) {
      return res.send(error(404, "wrong password"));
    }
    const hashedPassword = await hashPassword(newPassword);
    teacher["password"] = hashedPassword;
    await teacher.save();
    
    return res.send(success(200,"password updated successfully"));
  } catch (err) {
    return res.send(error(500,err.message));
  }
}