import { error } from "../../utills/responseWrapper.js";
import {
  existingParentRegisterSchema,
  parentLoginSchema,
  parentRegisterSchema
} from "../../validators/parentSchema.validator.js";

export async function registerParentValidation(req, res, next) {
  try {
    const studentId = req.params.studentId;
    const { username, firstname, lastname, phone, email, password, address } =
      req.body;
    const { error: schemaError } = parentRegisterSchema.validate({
      username,
      firstname,
      lastname,
      phone,
      email,
      password,
      address,
      studentId
    });
    if (schemaError) {
      return res.send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.send(error(500, err.message));
  }
}
export async function registerExistingParentValidation(req, res, next) {
  try {
    const studentId = req.params.studentId;
    const { parentId } = req.body;
    const { error: schemaError } = existingParentRegisterSchema.validate({
      parentId,
      studentId
    });
    if (schemaError) {
      return res.send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.send(error(500, err.me));
  }
}
export async function loginParentValidation(req, res, next) {
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
