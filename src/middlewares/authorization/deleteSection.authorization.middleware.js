import { findSectionById, getSectionStudents } from "../../services/section.services.js";
import { error, success } from "../../utills/responseWrapper.js";

export async function deleteSectionAuthorization(req,res,next){
    try {
        const sectionId = req.params.sectionId;
        const adminId = req.adminId;
        const section = await findSectionById(sectionId);
        if(!section){
            return res.send(error(400,"section doesn't exists"));
        }
        console.log((section["admin"]?.toString())!=adminId);
        if((section["admin"]?.toString())!=adminId){
            return res.send(error(400,"section doesn't belong to this admin"));
        }
        const sectionStudentList = await getSectionStudents({sectionId,adminId});
        if(sectionStudentList.length>0){
            return res.send(error(400,"can't delete section, it has students."));
        }
       next();      
    } catch (err) {
        return res.send(error(500,err.message));     
    }
}