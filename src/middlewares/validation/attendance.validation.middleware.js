import { error } from "../../utills/responseWrapper.js";
import { markPresentSchema } from "../../validators/attendanceSchema.validator.js";

export async function markPresentValidation(req,res,next){
    try {
        const{studentId , sectionId,isPresent} = req.body;
        const classTeacherId = req.classTeacherId;
        const {error:schemaError} = markPresentSchema.validate({studentId, sectionId , isPresent});
        if(schemaError){
            return res.send(error(400, schemaError.details[0].message));
          }
          next();        
    } catch (err) {
        return res.send(error(500,err.message));       
    }
}