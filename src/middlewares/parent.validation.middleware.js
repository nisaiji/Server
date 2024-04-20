import { error } from "../utills/responseWrapper.js";
import {
  parentLoginSchema,
  parentRegisterSchema
} from "../validators/parentSchema.validator.js";

export async function parentRegisterValidation(req, res, next) {
  try {
    const { username, firstname, lastname, phone, email, password, address } =
      req.body;
    const { error: schemaError } = parentRegisterSchema.validate({
      username,
      firstname,
      lastname,
      phone,
      email,
      password,
      address
    });
    if (schemaError) {
      return res.send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function parentLoginValidation(req, res, next) {
  try {
    const { username, password } = req.body;
    const { error: schemaError } = parentLoginSchema.validate({
      username,
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
