import {
  checkClassExistById,
  checkSectionExist,
  createSection,
  deleteSection,
  findSectionById,
  getAllSection,
  getClassSections,
} from "../services/section.services.js";
import {
  findClassTeacherById,
  findTeacherById,
} from "../services/teacher.services.js";
import { error, success } from "../utills/responseWrapper.js";

export async function registerSectionController(req, res) {
  try {
    const { name, teacherId, classId } = req.body;
    const adminId = req.adminId;
    const existingClass = await checkClassExistById(classId);
    if (!existingClass) {
      return res.send(error(400, "class doesn't exists"));
    }
    const existingSection = await checkSectionExist(name, classId, adminId);
    if (existingSection) {
      return res.send(error(400, "section name already exist"));
    }
    const section = await createSection(name, teacherId, classId, adminId);
    const classTeacher = await findTeacherById(teacherId);
    if (!classTeacher) {
      return res.send(error(400, "cordinator doesn't exist"));
    }
    classTeacher?.section?.push(section["_id"]);
    classTeacher.isClassTeacher = true;
    await classTeacher.save();
    existingClass["section"]?.push(section["_id"]);
    await existingClass.save();
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

export async function getClassSectionsController(req, res) {
  try {
    const classId = req.params.classId;
    const existingClass = await checkClassExistById(classId);
    if (!existingClass) {
      return res.send(error(400, "class doesn't exists"));
    }
    const sectionlist = await getClassSections(classId);
    return res.send(success(200, sectionlist));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function deleteSectionController(req, res) {
  try {
    const sectionId = req.params.sectionId;
    const section = await findSectionById(sectionId);
    if (!section) {
      return res.send(error(400, "section doesn't exists"));
    }
    if (section["students"].length > 0) {
      return res.send(
        error(400, "can't delete section, there are students in section.")
      );
    }
    if (section["classTeacher"]) {
      return res.send(
        error(
          400,
          "can't delete section, first remove class teacher from section."
        )
      );
    }

    const deletedSection = await deleteSection(sectionId);
    if (deletedSection instanceof Error) {
      return res.send(error(400, "can't delete section"));
    }

    return res.send(success(200, "section deleted successfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}
