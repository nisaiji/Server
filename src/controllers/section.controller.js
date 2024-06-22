import {
  checkClassExistById,
  checkSectionExist,
  createSection,
  deleteSection,
  findSectionById,
  getAllSection,
  getClassSections
} from "../services/section.services.js";
import {
  findClassTeacherById,
  findTeacherById
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

export async function replaceTeacherController(req, res) {
  try {
    const adminId = req.adminId;
    const { sectionId, teacherId } = req.body;
    const section = await findSectionById(sectionId);
    if (!section) {
      return res.send(error(400, "section doesn't exists"));
    }
    const teacher = await findTeacherById(teacherId);
    if (!teacher) {
      return res.send(error(400, "teacher doesn't exists"));
    }
    // console.log({ a: section["admin"].to_string(), b: adminId });
    if (section["admin"].toString() !== adminId) {
      return res.send(400, "admin doesn't have access to this section");
    }
    if (teacher["admin"].toString() !== adminId) {
      return res.send(400, "admin doesn't have access to this teacher");
    }

    section["classTeacher"] = teacherId;
    await section.save();
    return res.send(
      success(200, "new teacher assigned to section sucessfully")
    );
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
    const adminId = req.adminId;
    const section = await findSectionById(sectionId);

    const deletedSection = await deleteSection({ sectionId });
    if (deletedSection instanceof Error) {
      return res.send(error(400, "can't delete section"));
    }

    return res.send(success(200, "section deleted successfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}
