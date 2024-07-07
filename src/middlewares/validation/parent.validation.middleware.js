import { error } from "../../utills/responseWrapper.js";
import {
  existingParentRegisterSchema,
  parentAuthUpdateSchema,
  parentLoginSchema,
  parentProfileInfoUpdateSchema,
  parentProfileUpdateSchema,
  parentRegisterSchema,
  parentUpdateSchema
} from "../../validators/parentSchema.validator.js";

export async function registerParentValidation(req, res, next) {
  try {
    const studentId = req.params.studentId;
    // const { username, firstname, lastname, phone, email, password, address } =
    //   req.body;
    const { error: schemaError } = parentRegisterSchema.validate({studentId});
    if (schemaError) {
      return res.send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.send(error(500, err.message));
  }
}
// export async function registerParentValidation(req, res, next) {
//   try {
//     const studentId = req.params.studentId;
//     const { username, firstname, lastname, phone, email, password, address } =
//       req.body;
//     const { error: schemaError } = parentRegisterSchema.validate({
//       username,
//       firstname,
//       lastname,
//       phone,
//       email,
//       password,
//       address,
//       studentId
//     });
//     if (schemaError) {
//       return res.send(error(400, schemaError.details[0].message));
//     }
//     next();
//   } catch (err) {
//     return res.send(error(500, err.message));
//   }
// }
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
    const { user, password } = req.body;
    const { error: schemaError } = parentLoginSchema.validate({
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

export async function updateParentValidation(req,res,next){
  try {
    const parentId = req.params.parentId;
    const { username, firstname, lastname, phone, email, password, address } = req.body;
    const {error:schemaError} = parentUpdateSchema.validate({parentId,username, firstname, lastname, phone, email, password, address});
    if(schemaError){
      return res.send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err){
    return res.send(error(500,err.message));    
  }
}


// -------------------------
export async function authUpdateParentValidation(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const { error: schemaError } = parentAuthUpdateSchema.validate({
      username,
      password
    });

    if (schemaError) {
      return res.send(error(400, schemaError.details[0].message));
    }
    next()
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function profileUpdateParentValidation(req, res, next) {
  try {
    const {phone,email} = req.body;
    const { error: schemaError } = parentProfileUpdateSchema.validate({
      phone,
      email
    });

    if (schemaError) {
      return res.send(error(400, schemaError.details[0].message));
    }
    next()
  } catch (err) {
    return res.send(error(500, err.message));
  }
}
export async function profileInfoUpdateParentValidation(req, res, next) {
  try {
    const {fullname,age,gender,address,qualification,occupation} = req.body;
    // console.log({fullname,age,gender,address,qualification,occupation})
    const { error: schemaError } = parentProfileInfoUpdateSchema.validate({fullname,age,gender,address,qualification,occupation});

    if (schemaError) {
      return res.send(error(400, schemaError.details[0].message));
    }
    next()
  } catch (err) {
    return res.send(error(500, err.message));
  }
}