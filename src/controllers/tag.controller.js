import {StatusCodes} from "http-status-codes";
import {error, success} from "../utills/responseWrapper.js";
import {getSubjectService} from "../services/subject.service.js";
import {getTeacherSubjectSectionService} from "../services/teacherSubjectSection.service.js";
import { convertToMongoId } from "../services/mongoose.services.js";
import { getSessionService } from "../services/session.services.js";
import { getDayNameService, getStartAndEndTimeService, timestampToIstDate } from "../services/celender.service.js";
import { getWorkDayService } from "../services/workDay.services.js";
import { createTagService, deleteTagService, getTagService, updateTagService } from "../services/tag.service.js";

export async function createTagController(req, res) {
    try {
        let { subjectId, sectionId, sessionId, startDate, endDate, classId, title, description } = req.body;
        const teacherId = req.teacherId;
        const schoolId = req.adminId;
        startDate = parseInt(startDate);
        endDate = parseInt(endDate);
        const subject = await getSubjectService({_id: subjectId});
        if(!subject) {
            return res.status(StatusCodes.NOT_FOUND).send(error(404, "Subject not found"));
        }
        const teacherSubjectSection = await getTeacherSubjectSectionService({teacher: teacherId, subject: subjectId, section: sectionId, session: sessionId, school: schoolId});
        if(!teacherSubjectSection) {
            return res.status(StatusCodes.NOT_FOUND).send(error(404, "Teacher is not authorized for this action"));
        }

        let startIstDate = timestampToIstDate(startDate);
        let endIstDate = timestampToIstDate(endDate);
        const { startTime: tempStartTimestamp, endTime: tempEndTimestamp } = getStartAndEndTimeService(startIstDate, endIstDate);

        startIstDate = timestampToIstDate(tempStartTimestamp);
        endIstDate = timestampToIstDate(tempEndTimestamp);

        let currIstDate = startIstDate;
        while (currIstDate <= endIstDate) {
            const { startTime: currIstDateStartTimestamp, endTime: currIstDateEndTimestamp } = getStartAndEndTimeService(currIstDate, currIstDate);
            const currDateTag = await getTagService({ school: schoolId, subject: subjectId, session: sessionId, section: sectionId, date: { $gte: currIstDateStartTimestamp, $lte: currIstDateEndTimestamp } });

            // const day = getDayNameService(currIstDate.getDay());
            // if (day === 'Sunday') {
            //     const currDateWorkday = await getWorkDayService({ admin: adminId, date: { $gte: currIstDateStartTimestamp, $lte: currIstDateEndTimestamp } });
            //     if (currDateWorkday) {
            //         await deleteWorkDayService({ '_id': currDateWorkday['_id'] });
            //     }
            // }

            if (!currDateTag) {
               const teachingEvent = await createTagService({teacher: teacherId, subject: subjectId, section: sectionId, session: sessionId, classId, title, description, date: currIstDate, school: schoolId});
            }
            currIstDate.setDate(currIstDate.getDate() + 1)
        }
        return res.status(StatusCodes.CREATED).send(success(201, "Tag created successfully"));
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    }
}

export async function updateTagController(req, res) {
    try {
        const tagId = req.params.tagId;
        const { title, description, date } = req.body;
        const teacherId = req.teacherId;
        const schoolId = req.adminId;
        const tag = await getTagService({_id: teachingEventId, teacher: teacherId, school: schoolId});
        const session = await getSessionService({_id: teachingEvent.session});
        if(!tag) {
            return res.status(StatusCodes.NOT_FOUND).send(error(404, "Tag not found"));
        }
        if(!session || session['status'] === 'completed') {
            return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session is completed. You cannot update tag"));
        }
        const params = {}
        if(title)params.title=title;
        if(description)params.description=description;
        if(date)params.date=date;
       await updateTagService( {_id: convertToMongoId(tagId)}, params);
        return res.status(StatusCodes.CREATED).send(success(200, "Tag updated successfully"));
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    }
}

export async function deleteTagController(req, res) {
    try {
        const tagId = req.params.tagId;
        const teacherId = req.teacherId;
        const schoolId = req.adminId;
        const tag = await getTagService({_id: tagId, teacher: teacherId, school: schoolId});
        const session = await getSessionService({_id: teachingEvent.session});
        if(!tag) {
            return res.status(StatusCodes.NOT_FOUND).send(error(404, "Tag not found"));
        }
        if(!session || session['status'] === 'completed') {
            return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session is completed. You cannot update event"));
        }
       await deleteTagService( {_id: convertToMongoId(tagId)});
        return res.status(StatusCodes.CREATED).send(success(200, "Tag deleted successfully"));
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

