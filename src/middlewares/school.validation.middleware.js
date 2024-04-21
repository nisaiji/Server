import { error } from "../utills/responseWrapper.js";
import { registerCordinatorSchema } from "../validators/cordinatorSchema.validator.js";
import { loginSchoolSchema, registerSchoolSchema } from "../validators/schoolSchema.validator.js";
import { registerSectionSchema } from "../validators/sectionSchema.validator.js";

export async function schoolRegisterValidation(req,res,next){
    try {
    const { name, affiliationNo, address, email, phone, adminName, password } =  req.body;
    const { error: schemaError } = registerSchoolSchema.validate({
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
        return res.send(error(500,err.message));        
    }
}

export async function schoolLoginValidation(req,res,next){
    try {
        const { adminName, password } = req.body;
        const { error: schemaError } = loginSchoolSchema.validate({
          adminName,
          password
        });
        if (schemaError) {
          return res.send(error(400, schemaError.details[0].message));
        }
       next();        
    } catch (err) {
        return res.send(error(500,err.message));        
    }
}

export async function cordinatorRegisterValidation(req,res,next){
  try {
  const { username, firstname, lastname, email, password, phone } = req.body;
  const { error: schemaError} = registerCordinatorSchema.validate({
    username,
    firstname,
    lastname,
    email,
    phone,
    password
  });

  if(schemaError){
    return res.send(error(400, schemaError.details[0].message));
  }
  next();
  } catch (err) {
    return res.send(error(500,err.message));
  }
}

export async function sectionRegisterValidation(req,res,next){
  try {
    const{name,cordinatorId} = req.body;
    const{error:schemaError} = registerSectionSchema.validate({
        name,
        cordinatorId
    });

    if(schemaError){
        return res.send(error(400,schemaError.details[0].message));
    }
    next();        
} catch (err) {
    return res.send(error(500,err.message));      
}
}