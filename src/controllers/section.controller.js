import { checkClassExistById, checkSectionExist, createSection, deleteSection, findSectionById, getAllSection } from "../services/section.services.js";
import { findClassTeacherById, findTeacherById } from "../services/teacher.services.js";
import { error, success } from "../utills/responseWrapper.js";

export async function registerSectionController(req, res){
    try{
      const { name, teacherId,classId } = req.body;
      const adminId = req.adminId;
  
      const existingClass = await checkClassExistById(classId);
      if(!existingClass){
        return res.send(error(400,"class doesn't exists"));
      }
      const existingSection = await checkSectionExist(name,classId,adminId);
      if (existingSection){
        return res.send(error(400, "section name already exist"));
      }
      const section = await createSection(name,teacherId,classId,adminId);
      // console.log(section);
      if(section instanceof Error){
        return res.send(error(400,"can't create section."))
      }
      const teacher = await findTeacherById(teacherId);
      if (!teacher){
        return res.send(error(400, "teacher doesn't exist"));
      }
      teacher["isClassTeacher"] = true;
      await teacher.save();

      existingClass["section"]?.push(section["_id"]);
      await existingClass.save();

      return res.send(success(201, "section created successfully!"));
    } catch (err) {
      return res.send(error(500, err.message));
    }
  }

export async function getAllSectionsController(req, res){
    try {
      const sectionlist = await getAllSection();
      return res.send(success(200, sectionlist));
    } catch (err) {
      return res.send(error(500, err.message));
    }
  }

export async function deleteSectionController(req,res){
  try {
    const sectionId = req.params.sectionId;
    const section = await findSectionById(sectionId);
    if(!section){
      return res.send(error(400,"section doesn't exists"));
    }
    if(section["students"].length > 0){
      return res.send(error(400,"can't delete section, there are students in section."));
    }
    if(section["classTeacher"]){
      return res.send(error(400,"can't delete section, first remove class teacher from section."));
    }

    const deletedSection = await deleteSection(sectionId);
    if(deletedSection instanceof Error){
      return res.send(error(400,"can't delete section"));
    }

    return res.send(success(200,"section deleted successfully"));

  } catch (err) {
    return res.send(error(500,err.message));    
  }
}