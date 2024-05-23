import { error } from "../../utills/responseWrapper.js";
import { createHolidayEventSchema } from "../../validators/holidayEventSchema.validator.js";

export async function createHolidayEventValidation(req,res,next){
    try {
        const{date,title,description,teacherHoliday,studentHoliday}=req.body;
        const adminId = req.adminId;
        console.log({date,"type":typeof date});
        const{error:schemaError} = createHolidayEventSchema.validate({date,title,description,teacherHoliday,studentHoliday,adminId});
        if(schemaError){
            return res.send(error(400, schemaError.details[0].message));
          }
          next();
    } catch (err) {
        return res.send(error(500,err.message)) ;    
    }
}