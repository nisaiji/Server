import { matchClassTeacherAndSection, matchStudentAndSection } from "../../services/attendance.service.js";
import { error } from "../../utills/responseWrapper.js";

// check class-teacher and student belong to same section. then only class-teacher mark the student attendance.
export async function classTeacherAuthorization(req,res,next){
    try {
        const{studentId,sectionId} = req.body;
        const classTeacherId = req.classTeacherId;
        // if class teacher belongs to section it returns section.
        const matchedSection = await matchClassTeacherAndSection(classTeacherId , sectionId);
        if(!matchedSection){
            return res.send(error(400,"class teacher does not belong to this section"));
        }
        // if student belongs to section it returns true.
        const matchStudent = matchStudentAndSection(matchedSection?.students , studentId);
        if(!matchStudent){
            return res.send(error(400,"student does not belong to this section"));
        }
        next();

    } catch (err) {
        return res.send(error(500,err.message));
    }
}