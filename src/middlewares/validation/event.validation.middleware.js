import { parentForgetPasswordSchema } from "../../validators/eventSchema.validator.js";

export async function parentForgetPasswordValidation(req,res,next){
  try {
      const{eventType,title,description} = req.body;
      const {error:schemaError} = parentForgetPasswordSchema.validate({eventType,title,description});
      if(schemaError){
          return res.send(error(400, schemaError.details[0].message));
      }
      next();        
  } catch (err) {
      return res.send(error(500,err.message));       
  }
}
