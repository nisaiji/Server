import { checkSectionExist, createSection, getAllSection } from "../services/section.services.js";
import { findClassTeacherById } from "../services/teacher.services.js";
import { error, success } from "../utills/responseWrapper.js";

export async function registerSectionController(req, res) {
    try{
      const { name, classTeacherId } = req.body;
      const adminId = req.adminId;
      const existingSection = await checkSectionExist(name);
      if (existingSection){
        return res.send(error(400, "section name already exist"));
      }
      const section = await createSection(name, classTeacherId,adminId);
      const classTeacher = await findClassTeacherById(classTeacherId);
      if (!classTeacher) {
        return res.send(error(400, "cordinator doesn't exist"));
      }
      // console.log(coordinator);
      classTeacher?.section?.push(section["_id"]);
      await classTeacher.save();
      return res.send(success(201, "section created successfully!"));
    } catch (err) {
      return res.send(error(500, err.message));
    }
  }

  export async function getAllSectionsController(req, res) {
    try {
      const sectionlist = await getAllSection();
      return res.send(success(200, sectionlist));
    } catch (err) {
      return res.send(error(500, err.message));
    }
  }
  