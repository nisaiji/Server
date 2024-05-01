import { error } from "../utills/responseWrapper.js";
import {
  teacherDeleteSchema,
  markTeacherAsCordinatorSchema,
  teacherLoginSchema,
  teacherRegisterSchema,
  
} from "../validators/teacherSchema.validator.js";

export async function registerTeacherValidation(req, res, next) {
  try {
    const { username, firstname, lastname, email, password, phone } = req.body;
    const { error: schemaError } = teacherRegisterSchema.validate({
      username,
      firstname,
      lastname,
      email,
      phone,
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

export async function loginTeacherValidation(req, res, next) {
  try {
    const { username, password } = req.body;
    const { error: schemaError } = teacherLoginSchema.validate({
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

export async function markTeacherAsCordinatorValidation(req, res, next) {
  try {
    const teacherId = req.params.teacherId;
    const { error: schemaError } = markTeacherAsCordinatorSchema.validate({ teacherId });
    if (schemaError) {
      return res.send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function deleteTeacherValidation(req, res, next) {
  try {
    const teacherId = req.params.teacherId;
    const { error: schemaError } = teacherDeleteSchema.validate({
      teacherId
    });
    if (schemaError) {
      return res.send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.send(error(500, err.message));
  }
}
