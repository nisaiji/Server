import superAdminModel from "../models/superAdmin.model.js"; // Ensure you have this model
import bcrypt from "bcrypt";

// Fetch Super Admin (by ID or other parameters)
export async function getSuperAdminService(paramObj) {
  try {
    const superAdmin = await superAdminModel.findOne(paramObj);
    return superAdmin;
  } catch (error) {
    throw error;
  }
}

// Register Super Admin (only one allowed)
export async function registerSuperAdminService(data) {
  try {
    // Check if a Super Admin already exists
    const existingSuperAdmin = await superAdminModel.findOne({ role: "superAdmin" });
    if (existingSuperAdmin) {
      throw new Error("Super Admin already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;

    // Create Super Admin
    const newSuperAdmin = await superAdminModel.create(data);
    return newSuperAdmin;
  } catch (error) {
    throw error;
  }
}

// Update Super Admin by ID
export async function updateSuperAdminByIdService(data) {
  try {
    const { id, fieldsToBeUpdated } = data;

    // Find and update Super Admin
    const updatedSuperAdmin = await superAdminModel.findByIdAndUpdate(id, fieldsToBeUpdated, {
      new: true, // Return the updated document
    });

    return updatedSuperAdmin;
  } catch (error) {
    throw error;
  }
}
