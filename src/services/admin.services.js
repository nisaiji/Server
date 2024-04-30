import adminModel from "../models/admin.model.js";

export async function checkAdminExist(adminName, email) {
  try {
    const admin = await adminModel.findOne({
      $or: [{ adminName }, { email }]
    });
    return admin;
  } catch (err) {
    return err;
  }
}

export async function createAdmin(
  name,
  affiliationNo,
  address,
  email,
  phone,
  adminName,
  password
) {
  try {
    const admin = await adminModel.create({
      name,
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

export async function findAdminByID(_id) {
  try {
    const admin = await adminModel.findById({ _id });
    return admin;
  } catch (err) {
    return err;
  }
}

