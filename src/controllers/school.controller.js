import generateAccessToken from "../services/accessToken.service.js";
import { error, success } from "../utills/responseWrapper.js";
import bcrypt from "bcrypt";
import {checkSchoolExist,createSchool,findSchoolByAdminName, findSchoolByID} from "../services/school.services.js";
import { hashPassword } from "../services/password.service.js";
import { checkCordinatorExist, createCordinator } from "../services/cordinator.services.js";

export async function registerController(req, res) {
  try {
    const { name, affiliationNo, address, email, phone, adminName, password } =  req.body;

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
    } n
    const accessToken = generateAccessToken({ schoolId:school["_id"] });
    return res.send(success(200, { accessToken }));
  } catch (err) {
    // console.log(err)
    return res.send(error(500, err.message));
  }
}


export async function registerCordinatorController(req,res){
  try {
    const schoolId = req.schoolId;
    // console.log("register cordinator controller");
    console.log({schoolId});
    const { username, firstname, lastname, email, password, phone } = req.body;
    const existingCordinator = await checkCordinatorExist(username, email);

    if (existingCordinator && existingCordinator?.username === username) {
            return res.send(error(400, "user name already exist"));
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
   return res.send(success(201,"cordinator created successfully"));
  } catch (err) {
    return res.send(error(500,err.message));    
  }
}