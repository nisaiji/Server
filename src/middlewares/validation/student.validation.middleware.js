import { error } from "../../utills/responseWrapper.js";
import {deleteStudentSchema, registerStudentSchema, studentParentUpdateStudentSchema, updateStudentByAdminSchema,updateStudentByParentSchema,updateStudentByTeacherSchema} from "../../validators/studentSchema.validator.js";

export async function registerStudentValidation(req, res, next) {
  try {
    const { error: schemaError } = registerStudentSchema.validate(req.body);
    if (schemaError) {
      return res.send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function deleteStudentValidation(req, res, next) {
  try {
      const studentId = req.params.studentId;
      const { error: schemaError } = deleteStudentSchema.validate({studentId});
      if (schemaError) {
        return res.send(error(400, schemaError.details[0].message));
      }
      next();
    } catch (err) {
      return res.send(error(500, err.message));
    }
}

export async function updateStudentByTeacherValidation(req, res, next) {
  try {
    const { error: schemaError } = updateStudentByTeacherSchema.validate(req.body);
    if (schemaError) {
      return res.send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function updateStudentByAdminValidation(req, res, next) {
  try {
    const { error: schemaError } = updateStudentByAdminSchema.validate(req.body);
    if (schemaError) {
      return res.send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function updateStudentByParentValidation(req,res,next){
  try {
    const { error: schemaError } = updateStudentByParentSchema.validate(req.body);
    if (schemaError){
      return res.send(error(400, schemaError.details[0].message));
    }
    next(); 
  } catch (err) {
    return res.send(error(500,err.message));
  }
}


// ----------------------------------------------------------

export async function studentParentUpdateStudentValidation(req,res,next){
  try {
    const { error: schemaError } = studentParentUpdateStudentSchema.validate(req.body);
    if (schemaError){
      return res.send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.send(error(500,err.message));
  }
}