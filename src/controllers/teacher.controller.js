import {getTeacherService, registerTeacherService, getAllTeacherOfAdminService, updateTeacherService, getTeachersService } from "../services/teacher.services.js";
import {matchPasswordService,hashPasswordService} from "../services/password.service.js";
import { error, success } from "../utills/responseWrapper.js";
import { getAccessTokenService } from "../services/JWTToken.service.js";
import { getSectionByTeacherId } from "../services/section.services.js";
import { getClassService } from "../services/class.sevices.js";
import { StatusCodes } from "http-status-codes";
import { isValidMongoId } from "../services/mongoose.services.js";

export async function registerTeacherController(req, res) {
  try {
    const adminId = req.adminId;
    const { firstname, phone } = req.body;
    const teacher = await getTeacherService({ phone, isActive:true });
    if (teacher) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Phone number already registered"));
    }
    const password = firstname + "@" + phone;
    const hashedPassword = await hashPasswordService(password);
    req.body["password"] = hashedPassword;
    req.body["admin"] = adminId;
    const newTeacher = await registerTeacherService(req.body);
    return res.status(StatusCodes.CREATED).send(success(201, "Teacher registered successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function loginTeacherController(req, res) {
  try {
    const { user, password } = req.body;
    const teacher = await getTeacherService({$or: [{ username: user }, { phone: user }, { email: user }],isActive:true});
    if (!teacher) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(404, "Unauthorized email user"));
    }
    const matchPassword = await matchPasswordService({enteredPassword:password,storedPassword:teacher["password"]});
    if (!matchPassword) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(404, "Unauthorized  user"));
    }
    const section = await getSectionByTeacherId(teacher["_id"]);
    if (!section) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Teacher is not assigned to any section"));
    }
    const Class = await getClassService({ _id:section["classId"] });
    const teacherEmail = teacher["email"]? teacher["email"]: "abc@gmail.com";
    const accessToken = getAccessTokenService({
      role: "teacher",
      teacherId: teacher["_id"],
      adminId: teacher["admin"],
      phone: teacher["phone"],
      sectionId: section["_id"],
      classId: Class["_id"],
      sectionName: section["name"],
      className: Class["name"],
      email: teacherEmail
    });
    const isLoginAlready = teacher["isLoginAlready"];
    teacher["isLoginAlready"] = true;
    await teacher.save();
    return res.status(StatusCodes.OK).send(success(200, {accessToken,firstname: teacher["firstname"],isLoginAlready}));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getAllTeacherOfAdminController(req, res) {
  try {
    const adminId = req.adminId;
    const teachers = await getAllTeacherOfAdminService(adminId);
    return res.status(StatusCodes.OK).send(success(200, teachers));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateTeacherController(req, res) {
  try {
    const teacherId = req.teacherId?req.teacherId:req.params.teacherId;
    if(!isValidMongoId(teacherId)){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400,"Invalid teacher Id"));
    }
    const teacher = await getTeacherService({_id:teacherId, isActive:true});
    if (!teacher) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Teacher doesn't exists"));
    }
    if(req.body["email"]){
      const teacher = await getTeacherService({_id:{$ne:teacherId}, email:req.body["email"], isActive:true});
      if(teacher){
        return res.status(StatusCodes.CONFLICT).send(error(409,"Email already registered"));
      }
    }
    if(req.body["phone"]){
      const teacher = await getTeacherService({_id:{$ne:teacherId}, phone:req.body["phone"], isActive:true});
      if(teacher){
        return res.status(StatusCodes.CONFLICT).send(error(409,"Phone already registered"));
      }
    }
    if(req.body["password"]){
      const hashedPassword = await hashPasswordService(req.body["password"]);
      req.body["password"] = hashedPassword;
    }

    req.body["id"] = teacherId;
    const updatedTeacher = await updateTeacherService(req.body);
    if (updatedTeacher instanceof Error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, "Details cann't be updated"));
    }
    return res.status(StatusCodes.OK).send(success(200, "Teacher updated successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function deleteTeacherController(req, res) {
  try {
    const teacherId = req.params.teacherId;
    if(!isValidMongoId(teacherId)){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400,"Invalid Teacher Id"));
    }

    const teacher = await getTeacherService({_id:teacherId, isActive:true});
    if(!teacher){
      return res.status(StatusCodes.NOT_FOUND).send(error(404,"Teacher not found"));
    }
    if (teacher["section"]) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Teacher is assigned to section. Can't delete teacher"));
    }
    teacher["isActive"] = false;
    await teacher.save();
    if (!teacher) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Teacher not found"));
    }
    return res.status(StatusCodes.OK).send(success(200, "Teacher deleted successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getTeacherController(req, res) {
  try {
    const id = req.params.teacherId?req.params.teacherId:req.teacherId;
    if(!isValidMongoId(id)){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400,"Invalid teacher Id"));
    }
    const teacher = await getTeacherService({_id:id, isActive:true});
    if(!teacher){
      return res.status(StatusCodes.NOT_FOUND).send(success(404,"Teacher not found"));
    }
    return res.status(StatusCodes.OK).send(success(200, teacher));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getAllNonSectionTeacherController(req, res) {
  
  try {
    const adminId = req.adminId;
    const teachers = await getTeachersService({admin:adminId,section:null});
    return res.send(success(200, teachers));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function changePasswordTeacherController(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;
    const teacherId = req.teacherId;
    const teacher = await getTeacherService({_id:teacherId, isActive:true});
    if (!teacher) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(401, "Unauthorized user"));
    }
    const isMatched = await matchPasswordService({enteredPassword:oldPassword,storedPassword:teacher["password"]});
    console.log(isMatched)
    if (!isMatched){
      return res.status(StatusCodes.UNAUTHORIZED).send(error(404, "Wrong password"));
    }
    const hashedPassword = await hashPasswordService(newPassword);
    teacher["password"] = hashedPassword;
    await teacher.save();

    return res.status(StatusCodes.OK).send(success(200, "Password updated successfully"));
  } catch (err) {
    return res.status(StatusCodes.OK).send(error(500, err.message));
  }
}
