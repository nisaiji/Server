import {StatusCodes} from "http-status-codes";
import {error, success} from "../utills/responseWrapper.js";
import {getSubjectService} from "../services/subject.service.js";
import {getTeacherSubjectSectionService} from "../services/teacherSubjectSection.service.js";
import {createTeachingEventsService, deleteTeachingEventService, getTeachingEventService, getTeachingEventsPipelineService, updateTeachingEventService} from "../services/teacherEvent.service.js";
import { convertToMongoId } from "../services/mongoose.services.js";
import { getSessionService } from "../services/session.services.js";

export async function createTeachingEventController(req, res) {
    try {
        const { subjectId, sectionId, sessionId, startDate, endDate, classId, title, description } = req.body;
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
        const teachingEvent = await createTeachingEventsService({teacher: teacherId, subject: subjectId, section: sectionId, session: sessionId, classId, title, description, startDate, endDate, school: schoolId});
        return res.status(StatusCodes.CREATED).send(success(201, "Event created successfully"));
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    }
}

export async function updateTeachingEventController(req, res) {
    try {
        const teachingEventId = req.params.teachingEventId;
        const { title, description, startDate, endDate } = req.body;
        const teacherId = req.teacherId;
        const schoolId = req.adminId;
        const teachingEvent = await getTeachingEventService({_id: teachingEventId, teacher: teacherId, school: schoolId});
        const session = await getSessionService({_id: teachingEvent.session});
        if(!teachingEvent) {
            return res.status(StatusCodes.NOT_FOUND).send(error(404, "Teaching event not found"));
        }
        if(!session || session['status'] === 'completed') {
            return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session is completed. You cannot update event"));
        }
       await updateTeachingEventService( {_id: convertToMongoId(teachingEventId)}, { title, description, startDate, endDate});
        return res.status(StatusCodes.CREATED).send(success(200, "Event updated successfully"));
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    }
}

export async function deleteTeachingEventController(req, res) {
    try {
        const teachingEventId = req.params.teachingEventId;
        const teacherId = req.teacherId;
        const schoolId = req.adminId;
        const teachingEvent = await getTeachingEventService({_id: teachingEventId, teacher: teacherId, school: schoolId});
        const session = await getSessionService({_id: teachingEvent.session});
        if(!teachingEvent) {
            return res.status(StatusCodes.NOT_FOUND).send(error(404, "Teaching event not found"));
        }
        if(!session || session['status'] === 'completed') {
            return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session is completed. You cannot update event"));
        }
       await deleteTeachingEventService( {_id: convertToMongoId(teachingEventId)});
        return res.status(StatusCodes.CREATED).send(success(200, "Event deleted successfully"));
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    }
}

export async function getTeachingEventsForTeacherController(req, res) {
    try {
        const {sectionId, sessionId, startTime, endTime} = req.body;
        const teacherId = req.teacherId;
        const teachingEvents = await getTeachingEventsPipelineService( [
            {
                $match: {
                    teacher: convertToMongoId(teacherId),
                    session: convertToMongoId(sessionId),
                    section: convertToMongoId(sectionId),
                    startDate: { $gte: startTime },
                    endDate: { $lte: endTime }
                }
            }
        ]);
        return res.status(StatusCodes.OK).send(success(200, teachingEvents));
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    }
}

