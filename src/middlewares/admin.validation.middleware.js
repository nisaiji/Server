import { error } from "../utills/responseWrapper.js";
import {
  loginAdminSchema,
  registerAdminSchema,
  
} from "../validators/adminSchema.validator.js";

export async function adminRegisterValidation(req, res, next) {
  try {
    const { name, affiliationNo, address, email, phone, adminName, password } =
      req.body;
    const { error: schemaError } = registerAdminSchema.validate({
      name,
      affiliationNo,
      address,
      email,
      phone,
      adminName,
      password
    });
    if (schemaError) {
      return res.send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function adminLoginValidation(req, res, next) {
  try {
    const { adminName, password } = req.body;
    const { error: schemaError } = loginAdminSchema.validate({
      adminName,
      password
    });
    if (schemaError) {
      return res.send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.send(error(500, err.message));
  }
}
