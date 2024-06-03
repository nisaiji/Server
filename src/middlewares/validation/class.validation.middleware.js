import { error } from "../../utills/responseWrapper.js"
import { createClassSchema } from "../../validators/classSchema.validator.js";

export async function classRegisterValidation(req,res,next){
    try {
        const {name} = req.body;
        const { error: schemaError } = createClassSchema.validate({
            name
          });
          if (schemaError) {
            return res.send(error(400, schemaError.details[0].message));
          }
          next();
    } catch (err) {
        return res.send(error(500,err.message));
    }
}