import bcrypt from "bcrypt";
import { getAccessTokenService } from "../services/JWTToken.service.js";

import { StatusCodes } from "http-status-codes";
import {
  getSuperAdminService,
  registerSuperAdminService,
  updateSuperAdminByIdService,
} from "../services/superAdmin.service.js";
import { error, success } from "../utills/responseWrapper.js";

// SuperAdmin Signup Controller (Only one Super Admin can be created)
export async function registerSuperAdminController(req, res) {
  try {
    const { username, email, password } = req.body;

    // Check if a Super Admin already exists
    const existingAdmin = await getSuperAdminService({});
    if (existingAdmin) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Super Admin already exists!"));
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new Super Admin
    const newSuperAdmin = await registerSuperAdminService({
      username,
      email,
      password: hashedPassword,
    });

    if (!newSuperAdmin) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, "Super Admin couldn't be registered"));
    }

    // Generate JWT token
    const accessToken = getAccessTokenService({
      role: "superadmin",
      adminId: newSuperAdmin._id,
    });

    return res.status(StatusCodes.CREATED).send(success(201, { accessToken, username }));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

// SuperAdmin Login Controller
export async function loginSuperAdminController(req, res) {
  try {
    const { email, password } = req.body;

    // Find Super Admin by email
    const superAdmin = await getSuperAdminService({ email });
    if (!superAdmin) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(401, "Unauthorized user"));
    }

    // Compare password
    const matchPassword = await bcrypt.compare(password, superAdmin.password);
    if (!matchPassword) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(401, "Invalid credentials"));
    }

    // Generate JWT token
    const accessToken = getAccessTokenService({
      role: "superadmin",
      adminId: superAdmin._id,
    });

    return res.status(StatusCodes.OK).send(success(200, { accessToken, username: superAdmin.username }));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

// SuperAdmin Update Profile Controller
export async function updateSuperAdminController(req, res) {
  try {
    const { username, email, password } = req.body;
    const adminId = req.adminId; // Extracted from JWT middleware

    // Check if another Super Admin with the same email/username exists
    const existingAdmin = await getSuperAdminService({
      $or: [{ username }, { email }],
      _id: { $ne: adminId },
    });
    if (existingAdmin) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Username or Email already exists."));
    }

    // Hash the new password if provided
    const updateFields = { username, email };
    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    // Update Super Admin's credentials
    const updatedSuperAdmin = await updateSuperAdminByIdService({ id: adminId, fieldsToBeUpdated: updateFields });
    if (!updatedSuperAdmin) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, "Super Admin couldn't be updated"));
    }

    return res.status(StatusCodes.OK).send(success(200, "Super Admin updated successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

// Get SuperAdmin Profile Controller
export async function getSuperAdminController(req, res) {
  try {
    const adminId = req.adminId; // Extracted from JWT middleware

    // Fetch Super Admin profile
    const superAdmin = await getSuperAdminService({ _id: adminId });
    if (!superAdmin) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Super Admin not found"));
    }

    return res.status(StatusCodes.OK).send(success(200, superAdmin));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}
