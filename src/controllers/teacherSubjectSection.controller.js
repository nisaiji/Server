import {getAdminService, registerAdminService} from "../services/admin.services.js";
import {StatusCodes} from "http-status-codes";
import {error, success} from "../utills/responseWrapper.js";
import {getSectionService} from "../services/section.services.js";
import {getClassService} from "../services/class.sevices.js";
import {getTeacherService} from "../services/teacher.services.js";
import {getSubjectService} from "../services/subject.service.js";
import {getSessionService} from "../services/session.services.js";
import {
    deleteTeacherSubjectSectionService,
    getTeacherSubjectSectionPipelineService,
    getTeacherSubjectSectionService,
    registerTeacherSubjectSectionService,
    updateTeacherSubjectSectionService
} from "../services/teacherSubjectSection.service.js";
import { convertToMongoId } from "../services/mongoose.services.js";

export async function createTeacherSubjectSectionController(req, res) {
    try {
        const { sectionId, classId, teacherId, subjectId, sessionId } = req.body;
        const schoolId = req.adminId;
        const [section, classInfo, teacher, subject, session] = await Promise.all([
            getSectionService({_id: sectionId, admin: schoolId}),
            getClassService({_id: classId, admin: schoolId}),
            getTeacherService({_id: teacherId, admin: schoolId}),
            getSubjectService({_id: subjectId}),
            getSessionService({_id: sessionId, school: schoolId}),
        ]);
        if(!section || !classInfo || !teacher || !subject || !session) {
            return res.status(404).send(error(404, "Invalid Request"));
        }

        const teacherSubjectSection = await getTeacherSubjectSectionService({teacher: teacherId,classId, section: sectionId, subject: subjectId, session: sessionId, school: schoolId });
        if(teacherSubjectSection) {
            return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Teacher already assigned for this subject in this section"));
        }

        const sectionSubject = await getTeacherSubjectSectionService({section: sectionId, subject: subjectId});
        if(sectionSubject) {
            return res.status(StatusCodes.BAD_REQUEST).send(error(404, "Teacher already assigned for this subject in this section"));
        }

        await registerTeacherSubjectSectionService({section:sectionId, classId, subject:subjectId, school: schoolId, session: sessionId, teacher: teacherId});
        return res.status(StatusCodes.CREATED).send(success(201, "Teacher assigned for this subject in this section successfully"));
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    }
}

export async function getAllSubjectsOfTeacherInSectionController(req, res) {
    try {
         const teacherId = req.teacherId;
         const pipeline = [ 
            {
                $match: {
                    teacher: convertToMongoId(teacherId)
                }
            },
            {
                $lookup: {
                    from: "subjects",
                    localField: "subject",
                    foreignField: "_id",
                    as: "subject"
                }
            },
            {
                $unwind: {
                    path: "$subject",
                    preserveNullAndEmptyArrays: true
                }  
            },
            {
                $lookup: {
                    from: "sections",
                    localField: "section",
                    foreignField: "_id",
                    as: "section"
                }
            },
            {
                $unwind: {  
                    path: "$section",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "classes",
                    localField: "classId",
                    foreignField: "_id",
                    as: "class"
                }
            },
            {
                $unwind: {
                    path: "$class",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {  
                    from: "teachers",
                    localField: "teacher",
                    foreignField: "_id",
                    as: "teacher"
                }
            },
            {
                $unwind: {
                    path: "$teacher",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    teacherId: "$teacher._id",
                    teacherFirstName: "$teacher.firstname",
                    teacherLastName: "$teacher.lastname",
                    teacherEmail: "$teacher.email",
                    teacherPhone: "$teacher.phone",
                    teacherGender: "$teacher.gender",
                    teacherTId: "$teacher.teacherId",
                    classId: "$class._id",
                    className: "$class.name",
                    sectionId: "$section._id",
                    sectionName: "$section.name",
                    subjectId: "$subject._id",
                    subjectName: "$subject.name",
                    subjectCode: "$subject.code",
                    _id: 0
                }
            }
         ];
        
         const teacherSubjectSections = await getTeacherSubjectSectionPipelineService(pipeline);
        return res.status(StatusCodes.OK).send(success(200, teacherSubjectSections));
    }catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    }   
}

export async function getAllSubjectsTeachersOfSectionController(req, res) {
    try {
         const sectionId = req.sectionId;
         const pipeline = [ 
            {
                $match: {
                    section: convertToMongoId(sectionId)
                }
            },
            {
                $lookup: {
                    from: "subjects",
                    localField: "subject",
                    foreignField: "_id",
                    as: "subject"
                }
            },
            {
                $unwind: {
                    path: "$subject",
                    preserveNullAndEmptyArrays: true
                }  
            },
            {
                $lookup: {
                    from: "sections",
                    localField: "section",
                    foreignField: "_id",
                    as: "section"
                }
            },
            {
                $unwind: {  
                    path: "$section",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "classes",
                    localField: "classId",
                    foreignField: "_id",
                    as: "class"
                }
            },
            {
                $unwind: {
                    path: "$class",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {  
                    from: "teachers",
                    localField: "teacher",
                    foreignField: "_id",
                    as: "teacher"
                }
            },
            {
                $unwind: {
                    path: "$teacher",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    teacherId: "$teacher._id",
                    teacherFirstName: "$teacher.firstname",
                    teacherLastName: "$teacher.lastname",
                    teacherEmail: "$teacher.email",
                    teacherPhone: "$teacher.phone",
                    teacherGender: "$teacher.gender",
                    teacherTId: "$teacher.teacherId",
                    classId: "$class._id",
                    className: "$class.name",
                    sectionId: "$section._id",
                    sectionName: "$section.name",
                    subjectId: "$subject._id",
                    subjectName: "$subject.name",
                    subjectCode: "$subject.code",
                    _id: 0
                }
            }
         ];
        
         const teacherSubjectSections = await getTeacherSubjectSectionPipelineService(pipeline);
        return res.status(StatusCodes.OK).send(success(200, teacherSubjectSections));
    }catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    }   
}

export async function getAllSubjectsTeachersOfSectionForAdminController(req, res) {
    try {
         const sectionId = req.params.sectionId;
         const pipeline = [
            {
                $match: {
                    section: convertToMongoId(sectionId)
                }
            },
            {
                $lookup: {
                    from: "subjects",
                    localField: "subject",
                    foreignField: "_id",
                    as: "subject"
                }
            },
            {
                $unwind: {
                    path: "$subject",
                    preserveNullAndEmptyArrays: true
                }  
            },
            {
                $lookup: {
                    from: "sections",
                    localField: "section",
                    foreignField: "_id",
                    as: "section"
                }
            },
            {
                $unwind: {  
                    path: "$section",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "classes",
                    localField: "classId",
                    foreignField: "_id",
                    as: "class"
                }
            },
            {
                $unwind: {
                    path: "$class",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {  
                    from: "teachers",
                    localField: "teacher",
                    foreignField: "_id",
                    as: "teacher"
                }
            },
            {
                $unwind: {
                    path: "$teacher",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    teacherId: "$teacher._id",
                    teacherFirstName: "$teacher.firstname",
                    teacherLastName: "$teacher.lastname",
                    teacherEmail: "$teacher.email",
                    teacherPhone: "$teacher.phone",
                    teacherGender: "$teacher.gender",
                    teacherTId: "$teacher.teacherId",
                    classId: "$class._id",
                    className: "$class.name",
                    sectionId: "$section._id",
                    sectionName: "$section.name",
                    subjectId: "$subject._id",
                    subjectName: "$subject.name",
                    subjectCode: "$subject.code",
                }
            }
         ];
        
        const teacherSubjectSections = await getTeacherSubjectSectionPipelineService(pipeline);
        return res.status(StatusCodes.OK).send(success(200, teacherSubjectSections));
    }catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    }   
}

export async function deleteTeacherSubjectSectionController(req, res) {
    try {
        const teacherSubjectSectionId = req.params.teacherSubjectSectionId;
        const schoolId = req.adminId;
        const teacherSubjectSection = await getTeacherSubjectSectionService({_id: teacherSubjectSectionId, school: schoolId });
        if(!teacherSubjectSection) {
            return res.status(StatusCodes.NOT_FOUND).send(error(404, "Invalid request"));
        }
        await deleteTeacherSubjectSectionService({_id: teacherSubjectSectionId, school: schoolId });
        return res.status(StatusCodes.OK).send(success(200, "Teacher Subject Section deleted successfully"));
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    }
}

export async function updateTeacherSubjectSectionController(req, res) {
    try {
        const teacherSubjectSectionId = req.params.teacherSubjectSectionId;
        const { sectionId, classId, teacherId, subjectId, sessionId } = req.body;
        const schoolId = req.adminId;
        const teacherSubjectSection = await getTeacherSubjectSectionService({_id: teacherSubjectSectionId, school: schoolId });
        if(!teacherSubjectSection) {
            return res.status(StatusCodes.NOT_FOUND).send(error(404, "Invalid request"));
        }
        const update = {};
        if(sectionId) update.section = sectionId;
        if(classId) update.classId = classId;
        if(teacherId) update.teacher = teacherId;
        if(subjectId) update.subject = subjectId;
        if(sessionId) update.session = sessionId;
        await updateTeacherSubjectSectionService({_id: teacherSubjectSectionId }, update );
        return res.status(StatusCodes.OK).send(success(200, "Teacher assigned to subject successfully"));
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    }
}
