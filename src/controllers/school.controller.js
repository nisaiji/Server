import generateAccessToken from "../services/accessToken.service.js";
import { error, success } from "../utills/responseWrapper.js";
import bcrypt from "bcrypt";
import {
  checkSchoolExist,
  createSchool,
  findSchoolByAdminName,
  findSchoolByID
} from "../services/school.services.js";
import { hashPassword } from "../services/password.service.js";
import {
  checkCordinatorExist,
  createCordinator,
  findCordinatorById
} from "../services/cordinator.services.js";
import {
  checkSectionExist,
  checkStudentExistInSection,
  createSection,
  findSectionById
} from "../services/section.services.js";
import {
  checkStudentExist,
  findStudentById,
  registerStudent
} from "../services/student.service.js";
import studentModel from "../models/student.model.js";
import { checkChildExist, checkParentExist, createParent, findParentById } from "../services/parent.services.js";

export async function registerController(req, res) {
  try {
    const { name, affiliationNo, address, email, phone, adminName, password } =
      req.body;

    // const existingSchool = await schoolModel.findOne({$or :[{adminName},{email}]});
    const existingSchool = await checkSchoolExist(adminName, email);

    if (existingSchool && existingSchool?.adminName === adminName) {
      return res.send(error(400, "admin name already exist"));
    }
    if (existingSchool && existingSchool?.email === email) {
      return res.send(error(400, "email already exist"));
    }

    const hashedPassword = await hashPassword(password);

    // todo: verify affiliation

    // const school = await schoolModel.create({name,affiliationNo,address,email,phone,adminName,"password":hashedPassword});
    const school = await createSchool(
      name,
      affiliationNo,
      address,
      email,
      phone,
      adminName,
      hashedPassword
    );
    // console.log(school);
    return res.send(success(201, "School registered successfully!"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function loginController(req, res) {
  try {
    const { adminName, password } = req.body;
    // const school = await schoolModel.findOne({adminName});
    const school = await findSchoolByAdminName(adminName);
    if (!school) {
      return res.send(error(404, "admin name is not registered!"));
    }
    console.log({ password, p: school.password });
    const matchPassword = await bcrypt.compare(password, school.password);
    if (!matchPassword) {
      return res.send(error(404, "incorrect password"));
    }
    const accessToken = generateAccessToken({ schoolId: school["_id"] });
    return res.send(success(200, { accessToken }));
  } catch (err) {
    // console.log(err)
    return res.send(error(500, err.message));
  }
}

export async function registerCordinatorController(req, res) {
  try {
    const schoolId = req.schoolId;
    // console.log("register cordinator controller");
    console.log({ schoolId });
    const { username, firstname, lastname, email, password, phone } = req.body;
    const existingCordinator = await checkCordinatorExist(username, email);

    if (existingCordinator && existingCordinator?.username === username) {
      return res.send(error(400, "username name already exist"));
    }
    if (existingCordinator && existingCordinator?.email === email) {
      return res.send(error(400, "email already exist"));
    }
    const hashedPassword = await hashPassword(password);
    const cordinator = await createCordinator(
      username,
      firstname,
      lastname,
      email,
      hashedPassword,
      phone
    );
    const school = await findSchoolByID(schoolId);
    school.cordinators.push(cordinator["_id"]);
    await school.save();
    cordinator.school = school["_id"];
    await cordinator.save();
    return res.send(success(201, "cordinator created successfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}
 
export async function registerSectionController(req, res) {
  try {
    const { name, cordinatorId } = req.body;
    const existingSection = await checkSectionExist(name);
    if (existingSection) {
      return res.send(error(400, "section name already exist"));
    }
    const section = await createSection(name, cordinatorId);
    const cordinator = await findCordinatorById(cordinatorId);
    if (!cordinator) {
      return res.send(error(400, "cordinator doesn't exist"));
    }
    console.log(cordinator);
    cordinator?.section?.push(section["_id"]);
    await cordinator.save();
    return res.send(success(201, "section created successfully!"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

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
      classStd,
      address
    } = req.body;
    const schoolId = req.schoolId;
    const existingStudent = await checkStudentExist(rollNumber, schoolId);
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
      classStd,
      address,
      schoolId
    );
    return res.send(success(201, "student created successfully!"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function studentAddToSectionController(req, res) {
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

export async function registerParentController(req, res) {
  try {
    const studentId = req.params.studentId;
    const {username, firstname, lastname, phone, email, password, address } =  req.body;
    const existingParent = await checkParentExist(username, email);
    const student = await findStudentById(studentId);
    if(!student){
      return res.send(error(400,"student doesn't exists"));
    }
    if (existingParent && existingParent.username === username) {
      return res.send(error(400, "username already exists"));
    }
    if (existingParent && existingParent.email === email) {
      return res.send(error(400, "email already exists"));
    }
    const hashedPassword = await hashPassword(password);
    const parent = await createParent(
      username,
      firstname,
      lastname,
      phone,
      email,
      hashedPassword,
      address,
    );
    const isChildExist = checkChildExist(parent.child, studentId);
    if(isChildExist){
      return res.send(error(400 , "child already linked with parent"));
    }
    student.parent = parent["_id"];
    parent.child.push(student["_id"]);
    await student.save();
    await parent.save();

    return res.send(success(201, "parent registered successfully!"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function registerExistingParentController(req,res){
  try {
    const studentId = req.params.studentId;
    const{parentId} = req.body;
    const parent = await findParentById(parentId); 
    if(!parent){
      return res.send(error(400,"parent doesn't exists"));
    }
    

    
  } catch (err) {
    return res.send(error(500,err.message));
  }
}