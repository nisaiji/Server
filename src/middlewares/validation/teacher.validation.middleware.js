import { error } from "../../utills/responseWrapper.js";
import {
  teacherDeleteSchema,
  markTeacherAsClassTeacherSchema,
  classTeacherLoginSchema,
  teacherRegisterSchema,
  teacherUpdationSchema,
  teacherUpdateSchema,
  teacherAuthUpdateSchema,
  teacherProfileUpdateSchema,
  teacherAuthInfoUpdateSchema
} from "../../validators/teacherSchema.validator.js";

export async function registerTeacherValidation(req, res, next) {
  try {
    const { firstname, lastname, phone } = req.body;
    const { error: schemaError } = teacherRegisterSchema.validate({
      firstname,
      lastname,
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

export async function authUpdateTeacherValidation(req, res, next) {
  try {
    const { username, password } = req.body;
    const { error: schemaError } = teacherAuthUpdateSchema.validate({
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


export async function authInfoUpdateTeacherValidation(req, res, next) {
  try {
    const { email, phone } = req.body;
    const { error: schemaError } = teacherAuthInfoUpdateSchema.validate({
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

export async function profileUpdateTeacherValidation(req, res, next) {
  try {
    const {
      firstname,
      lastname,
      phone,
      dob,
      bloodGroup,
      gender,
      university,
      degree,
      address
    } = req.body;
    const { error: schemaError } = teacherProfileUpdateSchema.validate({
      firstname,
      lastname,
      phone,
      dob,
      bloodGroup,
      gender,
      university,
      degree,
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
export async function loginClassTeacherValidation(req, res, next) {
  try {
    const { user, password } = req.body;
    const { error: schemaError } = classTeacherLoginSchema.validate({
      user,
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
export async function updateClassTeacherValidation(req, res, next) {
  try {
    const teacherId = req.params.teacherId;
    const {
      firstname,
      lastname,
      dob,
      phone,
      bloodGroup,
      gender,
      university,
      degree
    } = req.body;
    const { error: schemaError } = teacherUpdateSchema.validate({
      teacherId,
      firstname,
      lastname,
      dob,
      phone,
      bloodGroup,
      gender,
      university,
      degree
    });
    if (schemaError) {
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
    const { error: schemaError } = markTeacherAsClassTeacherSchema.validate({
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
    const { username, firstname, lastname, email, phone } = req.body;
    const teacherId = req.params.teacherId;
    const { error: schemaError } = teacherUpdationSchema.validate({
      teacherId,
      username,
      firstname,
      lastname,
      email,
      phone,
      bloodGroup,
      gender,
      university,
      degree,
      dob
    });
    if (schemaError) {
      console.log(schemaError);
      return res.send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.send(error(500, err.message));
  }
}
