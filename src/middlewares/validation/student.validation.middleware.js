import { error } from "../../utills/responseWrapper.js";
import {
  adminRegisterStudentSchema,
  adminUpdateStudentSchema,
  deleteStudentSchema,
  registerStudentSchema,
  studentAddToSectionSchema,
} from "../../validators/studentSchema.validator.js";

// export async function registerStudentValidation(req, res, next) {
//   try {
//     const {
//       rollNumber,
//       firstname,
//       lastname,
//       gender,
//       age,
//       phone,
//       email,
//       address,
//     } = req.body;
//     const { error: schemaError } = registerStudentSchema.validate({
//       rollNumber,
//       firstname,
//       lastname,
//       gender,
//       age,
//       email,
//       phone,
//       address,
//     });

//     if (schemaError) {
//       return res.send(error(400, schemaError.details[0].message));
//     }
//     next();
//   } catch (err) {
//     return res.send(error(500, err.message));
//   }
// }

export async function registerStudentValidation(req, res, next) {
  try {
    const {
      firstname,
      lastname,
      gender,
      parentName,
      phone,
      sectionId,
      classId,
    } = req.body;
    const { error: schemaError } = adminRegisterStudentSchema.validate({
      firstname,
      lastname,
      gender,
      parentName,
      phone,
      sectionId,
      classId,
    });

    if (schemaError) {
      return res.send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.send(error(500, err.message));
  }
}
export async function adminUpdateStudentValidation(req, res, next) {
  try {
    const studentId = req.params.studentId;
    const {
      rollNumber,
      firstname,
      lastname,
      gender,
      age,
      phone,
      email,
      address,
      sectionId,
      classId,
    } = req.body;
    const { error: schemaError } = adminUpdateStudentSchema.validate({
      studentId,
      rollNumber,
      firstname,
      lastname,
      gender,
      age,
      email,
      phone,
      address,
      sectionId,
      classId,
    });

    if (schemaError) {
      return res.send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function addToSectionStudentValidation(req, res, next) {
  try {
    const studentId = req.params.studentId;
    const { sectionId } = req.body;
    // console.log()
    const { error: schemaError } = studentAddToSectionSchema.validate({
      studentId,
      sectionId,
    });
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
    try {
      const studentId = req.params.studentId;
      const { error: schemaError } = deleteStudentSchema.validate({
        studentId,
      });
      if (schemaError) {
        return res.send(error(400, schemaError.details[0].message));
      }
      next();
    } catch (err) {
      return res.send(error(500, err.message));
    }
  } catch (err) {
    return res.send(error(500, err.message));
  }
}
