import { StatusCodes } from "http-status-codes";
import { error } from "../../utills/responseWrapper.js";
import { createHolidaySchema, getHolidaySchema, updateHolidaySchema } from "../../validators/holidaySchema.validator.js";

export async function createHolidayValidation(req,res,next){
    try {
        const{error:schemaError} = createHolidaySchema.validate(req.body);
        if(schemaError){
            return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
        }
        next();
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500,err.message)) ;    
    }
}

export async function getHolidayValidation(req,res,next){
    try {
        const{error:schemaError} = getHolidaySchema.validate(req.body);
        if(schemaError){
            return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
        }
        next();
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500,err.message)) ;    
    }
}

export async function updateHolidayValidation(req,res,next){
    try {
        const{ error:schemaError } = updateHolidaySchema.validate(req.body);
        if(schemaError){
            return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
        }
        next();
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500,err.message)) ;    
    }
}