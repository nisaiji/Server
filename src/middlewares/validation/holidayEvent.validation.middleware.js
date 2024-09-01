import { StatusCodes } from "http-status-codes";
import { error } from "../../utills/responseWrapper.js";
import { createHolidayEventSchema, getHolidayEventSchema, updateHolidayEventSchema } from "../../validators/holidayEventSchema.validator.js";

export async function createHolidayEventValidation(req,res,next){
    try {
        const{error:schemaError} = createHolidayEventSchema.validate(req.body);
        if(schemaError){
            return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
        }
        next();
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500,err.message)) ;    
    }
}

export async function getHolidayEventValidation(req,res,next){
    try {
        const{error:schemaError} = getHolidayEventSchema.validate(req.body);
        if(schemaError){
            return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
        }
        next();
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500,err.message)) ;    
    }
}

export async function updateHolidayEventValidation(req,res,next){
    try {
        const{error:schemaError} = updateHolidayEventSchema.validate(req.body);
        if(schemaError){
            return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
        }
        next();
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500,err.message)) ;    
    }
}