import {getAdminService, registerAdminService} from "../services/admin.services.js";
import {StatusCodes} from "http-status-codes";
import {error, success} from "../utills/responseWrapper.js";
import {getSectionService} from "../services/section.services.js";
import {getClassService} from "../services/class.sevices.js";
import {getTeacherService} from "../services/teacher.services.js";
import {getSubjectService} from "../services/subject.service.js";
import {getSessionService} from "../services/session.services.js";
import {
    getTeacherSubjectSectionService,
    registerTeacherSubjectSectionService
} from "../services/teacherSubjectSection.service.js";

export async function createTeacherSubjectSectionController(req, res) {
    try {
        const { sectionId, classId, teacherId, subjectId, sessionId } = req.body;
        const schoolId = req.adminId;
        const [section, classInfo, teacher, subject, session] = await Promise.all(
            getSectionService({_id: sectionId, admin: schoolId}),
            getClassService({_id: classId, admin: schoolId}),
            getTeacherService({_id: teacherId, admin: teacher}),
            getSubjectService({_id: subjectId, school: subject}),
            getSessionService({_id: sessionId, school: schoolId}),
        )
        if(!section || !classInfo || !teacher || !subject || !session) {
            return res.status(404).send(error(404, "Some data not found"));
        }

        const teacherSubjectSection = await getTeacherSubjectSectionService({teacher: teacherId,classId, section: sectionId, subject: subjectId, session: sessionId, school: schoolId });
        if(teacherSubjectSection) {
            return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Teacher already assigned for this subject in this section"));
        }

        const sectionSubject = await getTeacherSubjectSectionService({section: sectionId, subject: subjectId});
        if(sectionSubject) {
            return res.status(StatusCodes.BAD_REQUEST).send(error(404, "Teacher already assigned for this subject in this section"));
        }

        await registerTeacherSubjectSectionService({section:sectionId, classId, subject:subjectId, school: schoolId, session: sessionId });
        return res.status(StatusCodes.CREATED).send(success(201, "Teacher assigned for this subject in this section successfully"));
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    }
}
