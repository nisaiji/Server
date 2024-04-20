import { error } from "../utills/responseWrapper.js";
import { loginCordinatorSchema } from "../validators/cordinatorSchema.validator.js";

// export async function cordinatorRegisterValidation(req,res,next){
//     try {
//     const { username, firstname, lastname, email, password, phone } = req.body;
//     const { error: schemaError } = registerCordinatorSchema.validate({
//       username,
//       firstname,
//       lastname,
//       email,
//       phone,
//       password
//     });

//     if(schemaError){
//       return res.send(error(400, schemaError.details[0].message));
//     }
//     next();
//     } catch (err) {
//       return res.send(error(500,err.message));
//     }
// }

export async function cordinatorLoginValidation(req, res, next) {
  try {
    const { username, password } = req.body;
    const { error: schemaError } = loginCordinatorSchema.validate({
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
