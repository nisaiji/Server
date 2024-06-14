import adminModel from "../models/admin.model.js";

export async function checkAdminExist(adminName, email,affiliationNo) {
  try {
    const admin = await adminModel.findOne({
      $or: [{ adminName }, { email },{affiliationNo}]
    });
    return admin;
  } catch (err) {
    return err;
  }
}

export async function createAdmin(
  schoolName,
  affiliationNo,
  address,
  email,
  phone,
  adminName,
  password
) {
  try {
    const admin = await adminModel.create({
      schoolName,
      affiliationNo,
      address,
      email,
      phone,
      adminName,
      password
    });
    return admin;
  } catch (err) {
    return err;
  }
}

export async function findAdminByAdminName(adminName) {
  try {
    const admin = await adminModel.findOne({ adminName });
    return admin;
  } catch (err) {
    return err;
  }
}

export async function findAdminByEmail(email) {
  try {
    const admin = await adminModel.findOne({ email:email });
    return admin;
  } catch (err) {
    return err;
  }
}

export async function findAdminByID(id) {
  try {
    const admin = await adminModel.findById(id);
    // console.log(admin);
    return admin;
  } catch (err) {
    return err;
  }
}