import {StatusCodes} from "http-status-codes";
import {error, success} from "../utills/responseWrapper.js";
import {getSubjectService} from "../services/subject.service.js";
import {getTeacherSubjectSectionService} from "../services/teacherSubjectSection.service.js";
import {createTeachingEventsService} from "../services/teacherEvent.service.js";

export async function createTeachingEventController(req, res) {
    try {
        const { subjectId, sectionId, sessionId, classId, title, description, date } = req.body;
        const teacherId = req.teacherId;
        const schoolId = req.adminId;
        const subject = await getSubjectService({_id: subjectId});
        if(!subject) {
            return res.status(StatusCodes.NOT_FOUND).send(error(404, "Subject not found"));
        }
        const teacherSubjectSection = await getTeacherSubjectSectionService({teacher: teacherId, subject: subjectId, section: sectionId, session: sessionId, school: schoolId});
        if(!teacherSubjectSection) {
            return res.status(StatusCodes.NOT_FOUND).send(error(404, "Teacher is not authorized for this action"));
        }
        const teachingEvent = await createTeachingEventsService({teacher: teacherId, subject: subjectId, section: sectionId, classId, title, description, date, school: schoolId});
        return res.status(StatusCodes.CREATED).send(success(201, "Event created successfully"));
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    }
}
