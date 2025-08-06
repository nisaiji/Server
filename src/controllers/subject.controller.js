import {StatusCodes} from "http-status-codes";
import {error, success} from "../utills/responseWrapper.js";
import {getSubjectService, registerSubjectService} from "../services/subject.service.js";

export async function createSubjectController(req, res) {
    try {
       const { name, code, description } = req.body;
       const schoolId = req.adminId;
       const subject = await getSubjectService({code, school: schoolId});
       if(subject) {
           return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Subject already exists"));
       }
       await registerSubjectService({code, name, description, school: schoolId});
       return res.status(StatusCodes.CREATED).send(success(201, "Event created successfully"));
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    }
}
