import generateAccessToken from "../services/accessToken.service.js";
import { error, success } from "../utills/responseWrapper.js";
import bcrypt from "bcrypt";
import {checkAdminExist, createAdmin,findAdminByAdminName} from "../services/admin.services.js";
import { hashPassword } from "../services/password.service.js";


export async function registerAdminController(req, res) {
  try {
    const { name, affiliationNo, address, email, phone, adminName, password } =
      req.body;

    // const existingSchool = await schoolModel.findOne({$or :[{adminName},{email}]});
    const existingSchool = await checkAdminExist(adminName, email);

    if (existingSchool && existingSchool?.adminName === adminName) {
      return res.send(error(400, "admin name already exist"));
    }
    if (existingSchool && existingSchool?.email === email) {
      return res.send(error(400, "email already exist"));
    }

    const hashedPassword = await hashPassword(password);

    // todo: verify affiliation

    // const school = await schoolModel.create({name,affiliationNo,address,email,phone,adminName,"password":hashedPassword});
    const school = await createAdmin(
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

export async function loginAdminController(req, res) {
  try {
    const { adminName, password } = req.body;
    const admin = await findAdminByAdminName(adminName);
    if (!admin) {
      return res.send(error(404, "admin name is not registered!"));
    }
    const matchPassword = await bcrypt.compare(password, school.password);
    if (!matchPassword) {
      return res.send(error(404, "incorrect password"));
    }
    const accessToken = generateAccessToken({ adminId: admin["_id"] });
    return res.send(success(200, { accessToken }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}