import { StatusCodes } from "http-status-codes";
import { getSectionService, updateSectionService } from "../../services/section.services.js";
import { getSessionService } from "../../services/session.services.js";
import { getSessionStudentService, registerSessionStudentService } from "../../services/v2/sessionStudent.service.js";
import { error, success } from "../../utills/responseWrapper.js";
import { getClassService } from "../../services/class.sevices.js";
import { getParentService, registerParentService } from "../../services/v2/parent.services.js";
import { getSchoolParentService, registerSchoolParentService } from "../../services/v2/schoolParent.services.js";
import { getStudentService, registerStudentService } from "../../services/student.service.js";

export async function registerStudentAndSessionStudentController(req, res) {
  try {
    const { firstname, lastname, gender, parentName, phone, email, qualification, occupation, address, age, parentAddress, parentGender, dob,  sectionId } = req.body;
    const adminId = req.adminId || '6872184b18bdcc2b1847b05b';

    const section = await getSectionService({ _id:sectionId });
    if(!section){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Section not found"));
    }
    const classInfo = await getClassService({ _id:section["classId"] });
    if(!classInfo){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Class not found"));
    }

    const session = await getSessionService({ _id:section["session"] });
    if(!session){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session not found"));
    }

    let parent = await getParentService({phone, isActive: true});
    let schoolParent = await getSchoolParentService({phone, school:adminId, isActive:true});

    if(!schoolParent) {
      if(!parent) {
        parent = await registerParentService({phone, status: 'unVerified'});
      }
      schoolParent = await registerSchoolParentService({
        fullname: parentName, 
        phone, 
        school: adminId, 
        parent: parent['_id'],
        ...(qualification && { qualification }),
        ...(occupation && { occupation }),
        ...(parentAddress && { address: parentAddress }),
        ...(parentGender && { gender: parentGender }),
        ...(age && { age }),
        ...(email && { email })
      });
    }

    let student = await getStudentService({ firstname, schoolParent: schoolParent["_id"] });
    if (student) {
      return res.status(StatusCodes.CONFLICT).send(error(400, "Student already exists"));
    }
    const studentObj = { firstname, lastname, gender, schoolParent: schoolParent["_id"], section:sectionId, classId:classInfo["_id"], parent: parent['_id'], admin:adminId, ...(address && {address}), ...(dob && {dob}) };

    student = await registerStudentService(studentObj);
    const sessionStudentObj = { section:sectionId, classId:classInfo["_id"], session: session['_id'], school:adminId, student: student['_id']};
    const sessionStudent = await registerSessionStudentService(sessionStudentObj);

    await updateSectionService({_id:sectionId}, {studentCount:section["studentCount"]+1});
    return res.status(StatusCodes.OK).send(success(201, "Student registered successfully!"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function registerSessionStudentController(req, res) {
  try {
    const { enrollmentStatus, studentId, sectionId, classId, sessionId } = req.body;
    const adminId = req.adminId || '6872184b18bdcc2b1847b05b';

    const section = await getSectionService({ _id:sectionId });
    if(!section){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Section not found"));
    }

    let student = await getStudentService({_id: studentId});
    if(!student){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Student not found"));
    }

    const classInfo = await getClassService({ _id:classId });
    if(!classInfo){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Class not found"));
    }

    const session = await getSessionService({ _id:sessionId });
    if(!session){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session not found"));
    }

    if(
      classInfo['session'].toString() !== session['_id'].toString() || 
      section['session'].toString() !== session['_id'].toString() ||
      section['classId'].toString() !== classInfo['_id'].toString()
     ) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Invalid class or section"));
    }

    let parent = await getParentService({_id: student['parent']});
    let schoolParent = await getSchoolParentService({_id: student['schoolParent']});

    if(!parent || !schoolParent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Parent not found"));
    }

    let sessionStudent = await getSessionStudentService({student: student['_id'], session: session['_id'], school: adminId});
    if(sessionStudent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Student already registered for this session"));
    }
    const sessionStudentObj = { section:section['_id'], classId:classInfo["_id"], session: session['_id'], school:adminId, student: student['_id']};
    sessionStudent = await registerSessionStudentService(sessionStudentObj);

    await updateSectionService({_id:sectionId}, {studentCount:section["studentCount"]+1});
    return res.status(StatusCodes.OK).send(success(201, {message: "Student registered successfully!", student: sessionStudent}));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

