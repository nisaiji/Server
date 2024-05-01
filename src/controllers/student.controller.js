import { checkStudentExistInSection, findSectionById } from "../services/section.services.js";
import { checkStudentExist, deleteStudentById, findStudentById, registerStudent } from "../services/student.service.js";
import { error, success } from "../utills/responseWrapper.js";

export async function registerStudentController(req, res) {
    try {
      const {
        rollNumber,
        firstname,
        lastname,
        gender,
        age,
        email,
        phone,
        classStd,
        address
      } = req.body;
      const schoolId = req.schoolId;
      const existingStudent = await checkStudentExist(rollNumber, schoolId);
      if (existingStudent) {
        return res.send(error(400, "roll number already exist"));
      }
      const student = await registerStudent(
        rollNumber,
        firstname,
        lastname,
        gender,
        age,
        phone,
        email,
        classStd,
        address,
        schoolId
      );
      return res.send(success(201, "student created successfully!"));
    } catch (err) {
      return res.send(error(500, err.message));
    }
  }

export async function addToSectionStudentController(req, res) {
    try {
      const studentId = req.params.studentId;
      const { sectionId } = req.body;
      const student = await findStudentById(studentId);
      if (!student) {
        return res.send(error(400, "student doesn't exists"));
      }
      const section = await findSectionById(sectionId);
      if (!section) {
        return res.send(error(400, "section doesn't exists"));
      }
      const isStudentExistInSection = checkStudentExistInSection(
        section.students,
        studentId
      );
      if (isStudentExistInSection) {
        return res.send(error(400, "student already exist in section"));
      }
      section?.students?.push(studentId);
      student.section = sectionId;
      await section.save();
      await student.save();
  
      return res.send(
        success(201, `${student.firstname} added to ${section.name} successfully`)
      );
    } catch (err) {
      return res.send(error(500, err.message));
    }
  }
  
export async function deleteStudentController(req, res) {
    try {
      const studentId = req.params.studentId;
      const student = await deleteStudentById(studentId);
      if (!student) {
        return res.send(error(400, "student doesn't exists"));
      }
      return res.send(success(200,'student deleted successfully'));

    } catch (err) {
      return res.send(error(500, err.message));
    }
  }