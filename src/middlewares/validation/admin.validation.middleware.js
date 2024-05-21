import { error } from "../../utills/responseWrapper.js";
import {
  loginAdminSchema,
  registerAdminSchema,
  
} from "../../validators/adminSchema.validator.js";

export async function adminRegisterValidation(req, res, next) {
  try {
    const { schoolName, affiliationNo, address, email, phone, adminName, password } =
      req.body;
    const { error: schemaError } = registerAdminSchema.validate({
      schoolName,
      affiliationNo,
      address,
      email,
      phone,
      adminName,
      password
    });
    if (schemaError) {
      const field = schemaError?.details[0]?.path[0];
      const errorMsg= schemaError?.details[0].message;
      console.log(schemaError?.details[0].path[0])
      return res.send(error(400, {field,errorMsg}));
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
      const field = schemaError?.details[0]?.path[0];
      const errorMsg= schemaError?.details[0].message;
      console.log(schemaError?.details[0].path[0])
      return res.send(error(400, {field,errorMsg}));
    }
    next();
  } catch (err) {
    return res.send(error(500, err.message));
  }
}
