import {StatusCodes} from "http-status-codes";
import {error, success} from "../utills/responseWrapper.js";
import {deleteSubjectService, getSubjectService, getSubjectsService, registerSubjectService, updateSubjectService} from "../services/subject.service.js";
import { getSessionService } from "../services/session.services.js";
import { getTeacherSubjectSectionsService } from "../services/teacherSubjectSection.service.js";

export async function createSubjectController(req, res) {
    try {
       const { name, code, description } = req.body;
       const schoolId = req.adminId;
       const subject = await getSubjectService({code, name});
       if(subject) {
           return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Subject already exists"));
       }
       await registerSubjectService({code, name, description});
       return res.status(StatusCodes.CREATED).send(success(201, "Subject created successfully"));
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    }
}

export async function getAllSubjectsController(req, res) {
    try {
       const subjects = await getSubjectsService({});
       return res.status(StatusCodes.OK).send(success(200, subjects));
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    }   
}

export async function getSubjectsController(req, res) {
    try {
        const sessionId = req.params.sessionId;
        const schoolId = req.adminId;
        const subjects = await getSubjectsService({school: schoolId, session: sessionId  });
        return res.status(StatusCodes.OK).send(success(200, subjects));
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    }
}

export async function deleteSubjectController(req, res) {
    try {
        const subjectId = req.params.subjectId;
        const subject = await getSubjectService({_id: subjectId });
        if(!subject) {
            return res.status(StatusCodes.NOT_FOUND).send(error(404, "Subject doesn't exists"));
        }
        deleteSubjectService({_id: subjectId });
        return res.status(StatusCodes.OK).send(success(200, "Subject deleted successfully"));
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    }
}

export async function getUnassignedSubjectsForSectionController(req, res) {
    try {
      const sectionId = req.params.sectionId;
      const sectionSubjects = await getTeacherSubjectSectionsService({section: sectionId});
      const sectionSubjectIds = sectionSubjects.map((sub) => sub.subject.toString());
      const unassignedSubjects = await getSubjectsService({_id: { $nin: sectionSubjectIds } });
      return res.status(StatusCodes.OK).send(success(200, unassignedSubjects));      
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    }
}

export async function updateSubjectController(req, res) {
    try {
        const subjectId = req.params.subjectId;
       const { name, code, description } = req.body;
       const subject = await getSubjectService({_id: subjectId });
       if(!subject) {
           return res.status(StatusCodes.BAD_REQUEST).send(error(404, "Subject not found"));
       }
       await updateSubjectService({_id: subjectId}, {name, code, description});
       return res.status(StatusCodes.CREATED).send(success(201, "Subject updated successfully"));
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    }
}
