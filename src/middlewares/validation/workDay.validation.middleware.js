import { StatusCodes } from "http-status-codes";
import { error } from "../../utills/responseWrapper.js";
import { createWorkDaySchema, getWorkDaySchema, updateWorkDaySchema } from "../../validators/workDaySchema.validator.js";

export async function createWorkDayValidation(req,res,next){
    try {
        const{error:schemaError} = createWorkDaySchema.validate(req.body);
        if(schemaError){
            return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
        }
        next();
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500,err.message)) ;    
    }
}

export async function getWorkDayValidation(req,res,next){
    try {
        const{error:schemaError} = getWorkDaySchema.validate(req.body);
        if(schemaError){
            return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
        }
        next();
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500,err.message)) ;    
    }
}

export async function updateWorkDayValidation(req,res,next){
    try {
        const{ error:schemaError } = updateWorkDaySchema.validate(req.body);
        if(schemaError){
            return res.status(StatusCodes.BAD_REQUEST).send(error(400, schemaError.details[0].message));
        }
        next();
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500,err.message)) ;    
    }
}
