import { error } from "../../utills/responseWrapper.js";
import {
  teacherDeleteSchema,
  markTeacherAsClassTeacherSchema,
  classTeacherLoginSchema,
  teacherRegisterSchema,
  teacherUpdationSchema,
} from "../../validators/teacherSchema.validator.js";

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

export async function loginClassTeacherValidation(req, res, next) {
  try {
    const { username, password } = req.body;
    const { error: schemaError } = classTeacherLoginSchema.validate({
      username,
      password
    });
    if (schemaError){
      return res.send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function markTeacherAsClassTeacherValidation(req, res, next) {
  try {
    const teacherId = req.params.teacherId;
    const { error: schemaError } = markTeacherAsClassTeacherSchema.validate({ teacherId });
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
export async function updateTeacherValidation(req, res, next) {
  try {
    const { username, firstname, lastname, email,  phone } = req.body;
    const teacherId = req.params.teacherId;
    const { error: schemaError } = teacherUpdationSchema.validate({
      teacherId,
      username,
      firstname,
      lastname,
      email,
      phone
    });
    if (schemaError) {
      return res.send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.send(error(500, err.message));
  }
}
