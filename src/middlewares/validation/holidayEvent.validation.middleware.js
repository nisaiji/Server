import { error } from "../../utills/responseWrapper.js";
import { createHolidayEventSchema } from "../../validators/holidayEventSchema.validator.js";

export async function createHolidayEventValidation(req,res,next){
    try {
        const{date,name,description,teacherHoliday,studentHoliday}=req.body;
        const adminId = req.adminId;
        const{error:schemaError} = createHolidayEventSchema.validate({date,name,description,teacherHoliday,studentHoliday,adminId});
        if(schemaError){
            return res.send(error(400, schemaError.details[0].message));
          }
          next();
    } catch (err) {
        return res.send(error(500,err.message)) ;    
    }
}