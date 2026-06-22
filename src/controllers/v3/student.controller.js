import fs from 'fs/promises';

import { StatusCodes } from "http-status-codes";
import xlsx from 'xlsx';

import { registerStudentsFromExcelHelper } from "../../helpers/v2/student.helper.js";
import { getStartAndEndTimeService } from "../../services/celender.service.js";
import { getClassService } from "../../services/class.services.js";
import { convertToMongoId } from "../../services/mongoose.services.js";
import { getSectionService, updateSectionService } from "../../services/section.services.js";
import { getSessionService } from "../../services/session.services.js";
import { getStudentService, getStudentsPipelineService, getStudentsService, registerStudentService, updateStudentService } from "../../services/student.service.js";
import {
  buildAttendanceSummaryForSessionStudent,
  buildExamSummaryForSessionStudent,
  buildLeaveSummaryForSessionStudent,
  buildSubjectSummaryForContext,
  calculateAttendancePercentageForSessionStudent,
} from "../../services/studentDetailSummary.service.js";
import { getTeacherSubjectSectionPipelineService } from "../../services/teacherSubjectSection.service.js";
import { getParentService, registerParentService, updateParentService } from "../../services/v2/parent.services.js";
import { getSchoolParentService, registerSchoolParentService, updateSchoolParentService } from "../../services/v2/schoolParent.services.js";
import { getSessionStudentService, getSessionStudentsPipelineService, registerSessionStudentService, updateSessionStudentService } from "../../services/v2/sessionStudent.service.js";
import { error, success } from "../../utils/responseWrapper.js";

const addFieldsIfPresent = (target, source, fields) => {
  fields.forEach((field) => {
    if (source[field] !== undefined) {
      target[field] = source[field];
    }
  });
};

export async function registerStudentAndSessionStudentController(req, res) {
  try {
    const studentData = req.body;
    const adminId = req.adminId;

    if (!studentData.sectionId) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "sectionId is required"));
    }

    const section = await getSectionService({ _id: studentData.sectionId });
    if (!section) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Section not found"));
    }

    const [classInfo, session, studentWithAadhar, parent, schoolParentFromDb] = await Promise.all([
      getClassService({ _id: section.classId }),
      getSessionService({ _id: section.session }),
      getStudentService({ aadharNumber: studentData.aadharNumber, isActive: true }),
      getParentService({ phone: studentData.phone, isActive: true }),
      getSchoolParentService({ phone: studentData.phone, school: adminId, isActive: true }),
    ]);

    if (!classInfo) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Class not found"));
    }

    if (!session) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session not found"));
    }

    if (session.status === "completed") {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Session is already completed"));
    }

    if (studentWithAadhar) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Aadhar number already registered"));
    }

    let parentObj = parent;
    let schoolParent = schoolParentFromDb;

    if (!schoolParentFromDb) {
        parentObj = parentObj ? parentObj : await registerParentService({ phone: studentData.phone, status: "unVerified" });
      
      schoolParent = await registerSchoolParentService({
        fullname: studentData.parentName,
        phone: studentData.phone,
        school: adminId,
        parent: parentObj._id,
        ...(studentData.qualification && { qualification:studentData.qualification }),
        ...(studentData.occupation && { occupation:studentData.occupation }),
        ...(studentData.parentAddress && { address: studentData.parentAddress }),
        ...(studentData.parentGender && { gender: studentData.parentGender }),
        ...(studentData.age && { age:studentData.age }),
        ...(studentData.email && { email:studentData.email }),
      });
    }

    const existingStudent = await getStudentService({ firstname: studentData.firstname, schoolParent: schoolParent._id });
    if (existingStudent) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Student already exists"));
    }

    const studentObj = {
      firstname:studentData.firstname,
      lastname: studentData.lastname,
      gender: studentData.gender,
      aadharNumber: studentData.aadharNumber,
      guardianName: studentData.guardianName,
      schoolParent: schoolParent._id,
      section: studentData.sectionId,
      classId: classInfo._id,
      parent: parentObj?._id,
      admin: adminId,
      ...(studentData.address && { address: studentData.address }),
      ...(studentData.dob && { dob: studentData.dob }),
    };

    const student = await registerStudentService(studentObj);

    const sessionStudentObj = {
      section: studentData.sectionId,
      classId: classInfo._id,
      session: session._id,
      school: adminId,
      student: student._id,
    };

    const [sessionStudent] = await Promise.all([
      registerSessionStudentService(sessionStudentObj),
      updateSectionService({ _id: studentData.sectionId }, { studentCount: (section.studentCount || 0) + 1 }),
    ]);

    return res.status(StatusCodes.CREATED).send(success(201, { message: "Student registered successfully!", student: sessionStudent }));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function registerSessionStudentController(req, res) {
  try {
    const { studentId, sectionId, classId, sessionId, aadharNumber } = req.body;
    const adminId = req.adminId;

    if (!studentId || !sectionId || !classId || !sessionId) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "studentId, sectionId, classId and sessionId are required"));
    }

    const [section, student, classInfo, session] = await Promise.all([
      getSectionService({ _id: sectionId }),
      getStudentService({ _id: studentId }),
      getClassService({ _id: classId }),
      getSessionService({ _id: sessionId }),
    ]);

    if (!section) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Section not found"));
    }

    if (!student) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Student not found"));
    }

    if (!classInfo) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Class not found"));
    }

    if (!session) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session not found"));
    }

    if (session.status === "completed") {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Session is completed"));
    }

    if (
      classInfo.session.toString() !== session._id.toString() ||
      section.session.toString() !== session._id.toString() ||
      section.classId.toString() !== classInfo._id.toString()
    ) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Invalid class or section"));
    }

    const [studentWithAadhar, parent, schoolParent] = await Promise.all([
      aadharNumber ? getStudentService({ aadharNumber, isActive: true }) : Promise.resolve(null),
      getParentService({ _id: student.parent }),
      getSchoolParentService({ _id: student.schoolParent }),
    ]);

    if (studentWithAadhar && studentWithAadhar._id.toString() !== studentId) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Aadhar number already registered"));
    }

    if (!parent || !schoolParent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Parent not found"));
    }

    const sessionStudent = await getSessionStudentService({ student: student._id, session: session._id, school: adminId });
    if (sessionStudent) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Student already registered for this session"));
    }

    const sessionStudentObj = {
      section: section._id,
      classId: classInfo._id,
      session: session._id,
      school: adminId,
      student: student._id,
      aadharNumber,
    };

    const [createdSessionStudent] = await Promise.all([
      registerSessionStudentService(sessionStudentObj),
      updateSectionService({ _id: sectionId }, { studentCount: (section.studentCount || 0) + 1 }),
    ]);

    return res.status(StatusCodes.CREATED).send(success(201, { message: "Student registered successfully!", student: createdSessionStudent }));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateStudentBySchoolController(req, res){
  try {
    const studentId = req.params.studentId;
    const studentUpdate = {};
    const schoolParentUpdate = {};
    const parentProfileUpdate = {};
    const adminId = req.adminId;

    const student = await getStudentService({ _id:studentId, isActive: true });
    if(!student){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Student not found"));
    }
    let schoolParent = await getSchoolParentService({ _id: student["schoolParent"] });
    if(!schoolParent){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Parent not found"));
    }
    let parent = await getParentService({ _id: student["parent"], isActive: true });
    if(!parent && schoolParent["parent"]) {
      parent = await getParentService({ _id: schoolParent["parent"], isActive: true });
      if(parent) {
        studentUpdate.parent = parent["_id"];
      }
    }
    if(!parent){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Parent not found"));
    }

    addFieldsIfPresent(studentUpdate, req.body, [
      "firstname",
      "lastname",
      "gender",
      "bloodGroup",
      "dob",
      "address",
      "city",
      "district",
      "state",
      "country",
      "pincode",
      "guardianName",
      "aadharNumber",
    ]);

    if (req.body.photo || req.body.method === "DELETE") {
      studentUpdate.photo = req.body.method === "DELETE" ? "" : req.body.photo;
    }

    const studentWithAadhar = await getStudentService({aadharNumber: studentUpdate.aadharNumber, isActive: true,});
    // If a student with same Aadhar exists AND it's not the same student
    if (studentWithAadhar && studentWithAadhar._id.toString() !== studentId) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Aadhar number already registered"));
    }
    if(req.body["phone"] && schoolParent['phone']!==req.body['phone']){
      const phone = req.body['phone'];
      if (parent && parent.students?.includes(studentId)) {
        return res.status(StatusCodes.BAD_REQUEST).send(error(400, 'Phone number can not be updated'));
      }

      const [schoolParentWithPhone, parentWithPhone] = await Promise.all([
        getSchoolParentService({ phone, school: student.adminId, isActive: true, _id: { $ne: schoolParent._id } }),
        getParentService({ phone, isActive: true, _id: { $ne: parent._id } }),
      ]);

      if (parentWithPhone || schoolParentWithPhone) {
        return res.status(StatusCodes.CONFLICT).send(error(409, "Phone number already registered"));
      }

      if (phone !== schoolParent.phone) {
        parent = await registerParentService({ phone, status: 'unVerified' });
        schoolParent = await registerSchoolParentService({ phone, school: adminId, parent: parent._id });
        studentUpdate.schoolParent = schoolParent._id;
        studentUpdate.parent = parent._id;
      }
    }
    addFieldsIfPresent(schoolParentUpdate, req.body, [
      "parentName",
      "parentGender",
      "parentAge",
      "parentEmail",
      "parentQualification",
      "parentOccupation",
      "parentAddress",
      "parentCity",
      "parentDistrict",
      "parentState",
      "parentCountry",
      "parentPincode",
    ]);

    if (req.body.parentDob) {
      parentProfileUpdate.dob = req.body.parentDob;
    }

    const updatePromises = [
      updateStudentService({ _id:studentId }, studentUpdate),
      updateSchoolParentService({ _id: schoolParent["_id"] }, schoolParentUpdate),
    ];
    if(Object.keys(parentProfileUpdate).length){
      updatePromises.push(updateParentService({ _id: parent["_id"] }, parentProfileUpdate));
    }

    await Promise.all(updatePromises);
    return res.status(StatusCodes.OK).send(success(200, "Student updated successfully"));

  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateStudentByParentController(req, res) {
  try {
    const studentId = req.params.studentId;
    const parentId = req.parentId;
    const studentUpdate = {};
    
    const student = await getStudentService({ _id:studentId, isActive: true });
    if(!student){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Student not found"));
    }
    const parent = await getParentService({ _id: parentId});
    if(!parent){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Parent not found"));
    }

    if(!parent['students']?.some(id => id.equals(studentId))) {
          return res.status(StatusCodes.BAD_REQUEST).send(error(400, 'User is not authorized'));
    }

addFieldsIfPresent(studentUpdate, req.body, [
      "firstname",
      "lastname",
      "gender",
      "bloodGroup",
      "dob",
      "address",
      "city",
      "district",
      "state",
      "country",
      "pincode",
      "guardianName",
    ]);

    if (req.body.photo || req.body.method === "DELETE") {
      studentUpdate.photo = req.body.method === "DELETE" ? "" : req.body.photo;
    }

    await updateStudentService({ _id:studentId }, studentUpdate);
    return res.status(StatusCodes.OK).send(success(200, "Student updated successfully"));    
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(501,err.message));
  }
}

function buildSessionStudentDetailPipeline(filter, startTime, endTime) {
  return [
    {
      $match: filter,
    },
    {
      $lookup: {
        from: "students",
        localField: "student",
        foreignField: "_id",
        as: "student",
      },
    },
    {
      $unwind: {
        path: "$student",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "schoolparents",
        localField: "student.schoolParent",
        foreignField: "_id",
        as: "schoolParent",
      },
    },
    {
      $unwind: {
        path: "$schoolParent",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "parents",
        localField: "student.parent",
        foreignField: "_id",
        as: "parent",
      },
    },
    {
      $unwind: {
        path: "$parent",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "sessions",
        localField: "session",
        foreignField: "_id",
        as: "session",
      },
    },
    {
      $unwind: {
        path: "$session",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "classes",
        localField: "classId",
        foreignField: "_id",
        as: "classInfo",
      },
    },
    {
      $unwind: {
        path: "$classInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "sections",
        localField: "section",
        foreignField: "_id",
        as: "section",
      },
    },
    {
      $unwind: {
        path: "$section",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "attendances",
        localField: "_id",
        foreignField: "sessionStudent",
        as: "attendances",
        pipeline: [
          { $match: { date: { $gte: startTime, $lte: endTime } } },
          { $project: { date: 1, day: 1, parentAttendance: 1, teacherAttendance: 1 } },
        ],
      },
    },
    {
      $unwind: {
        path: "$attendances",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        id: "$student._id",
        studentId: "$student.studentId",
        rollNumber: "$student.rollNumber",
        firstname: "$student.firstname",
        lastname: "$student.lastname",
        aadharNumber: "$student.aadharNumber",
        guardianName: "$student.guardianName",
        dob: "$student.dob",
        gender: "$student.gender",
        bloodGroup: "$student.bloodGroup",
        photo: "$student.photo",
        address: "$student.address",
        city: "$student.city",
        district: "$student.district",
        state: "$student.state",
        country: "$student.country",
        pincode: "$student.pincode",
        studentCreatedAt: "$student.createdAt",
        studentUpdatedAt: "$student.updatedAt",

        parentId: "$schoolParent._id",
        parentFullName: "$schoolParent.fullname",
        parentUsername: "$schoolParent.username",
        parentGender: "$schoolParent.gender",
        parentAge: "$schoolParent.age",
        parentAddress: "$schoolParent.address",
        parentCity: "$schoolParent.city",
        parentDistrict: "$schoolParent.district",
        parentState: "$schoolParent.state",
        parentCountry: "$schoolParent.country",
        parentPincode: "$schoolParent.pincode",
        parentStatus: "$schoolParent.status",
        parentQualification: "$schoolParent.qualification",
        parentOccupation: "$schoolParent.occupation",
        parentPhone: "$schoolParent.phone",
        parentEmail: "$schoolParent.email",
        parentIsLoginAlready: "$schoolParent.isLoginAlready",
        parentCreatedAt: "$schoolParent.createdAt",
        parentUpdatedAt: "$schoolParent.updatedAt",

        mainParentId: "$parent._id",
        mainParentFullName: "$parent.fullname",
        mainParentUsername: "$parent.username",
        mainParentGender: "$parent.gender",
        mainParentDob: "$parent.dob",
        mainParentAddress: "$parent.address",
        mainParentCity: "$parent.city",
        mainParentDistrict: "$parent.district",
        mainParentState: "$parent.state",
        mainParentCountry: "$parent.country",
        mainParentPincode: "$parent.pincode",
        mainParentStatus: "$parent.status",
        mainParentQualification: "$parent.qualification",
        mainParentOccupation: "$parent.occupation",
        mainParentPhone: "$parent.phone",
        mainParentEmail: "$parent.email",
        mainParentPhoto: "$parent.photo",
        mainParentFcmToken: "$parent.fcmToken",
        mainParentIsLoginAlready: "$parent.isLoginAlready",
        mainParentStudents: "$parent.students",
        mainParentCreatedAt: "$parent.createdAt",
        mainParentUpdatedAt: "$parent.updatedAt",

        sessionId: "$session._id",
        sessionName: "$session.name",
        sessionStartDate: "$session.startDate",
        sessionEndDate: "$session.endDate",
        sessionStatus: "$session.status",
        sessionStartYear: "$session.academicStartYear",
        sessionEndYear: "$session.academicEndYear",

        classId: "$classInfo._id",
        className: "$classInfo.name",

        sectionId: "$section._id",
        sectionName: "$section.name",

        todayAttendance: "$attendances.teacherAttendance",
      },
    },
    {
      $project: {
        student: 0,
        schoolParent: 0,
        parent: 0,
        section: 0,
        session: 0,
        classInfo: 0,
        attendances: 0,
      },
    },
  ];
}

export async function getSessionStudentSController(req,res) {
  try {
    let {school, session, classId, section, sessionStudentId } = req.query;
    const filter = {school: convertToMongoId(school), session: convertToMongoId(session), isActive: true};
    if(classId) filter['classId']= convertToMongoId(classId);
    if(section) filter['section']= convertToMongoId(section);
    if(sessionStudentId) filter['_id'] = convertToMongoId(sessionStudentId);
    const {startTime, endTime} = getStartAndEndTimeService(new Date(), new Date());

    const sessionStudents = await getSessionStudentsPipelineService(
      buildSessionStudentDetailPipeline(filter, startTime, endTime)
    );

    await Promise.all(
      sessionStudents.map((student) =>
        calculateAttendancePercentageForSessionStudent(student._id, student.sessionId).then((percentage) => {
          student.attendancePercentage = percentage;
        }),
      ),
    );

    return res.status(StatusCodes.OK).send(success(200, sessionStudents));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getAdminStudentDetailController(req, res) {
  try {
    const sessionStudentId = req.params.sessionStudentId;

    if (!sessionStudentId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(error(400, "sessionStudentId is required"));
    }

    const filter = {
      _id: convertToMongoId(sessionStudentId),
      school: convertToMongoId(req.adminId),
      isActive: true,
    };
    const { startTime, endTime } = getStartAndEndTimeService(new Date(), new Date());
    const sessionStudents = await getSessionStudentsPipelineService(
      buildSessionStudentDetailPipeline(filter, startTime, endTime)
    );
    const student = sessionStudents[0];

    if (!student) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Student not found"));
    }

    const [
      attendanceSummary,
      subjectSummary,
      leaveSummary,
      examSummary,
    ] = await Promise.all([
      buildAttendanceSummaryForSessionStudent(student._id, student.sessionId),
      buildSubjectSummaryForContext({
        schoolId: req.adminId,
        sessionId: student.sessionId,
        classId: student.classId,
        sectionId: student.sectionId,
      }),
      buildLeaveSummaryForSessionStudent(student._id),
      buildExamSummaryForSessionStudent({
        schoolId: req.adminId,
        sessionId: student.sessionId,
        sectionId: student.sectionId,
        sessionStudentId: student._id,
      }),
    ]);

    student.attendanceSummary = attendanceSummary;
    student.attendancePercentage = attendanceSummary.currentSessionPercentage;
    student.subjectSummary = subjectSummary;
    student.leaveSummary = leaveSummary;
    student.examSummary = examSummary;

    return res.status(StatusCodes.OK).send(success(200, student));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getAttendancesController(req, res){
  try {
    let { startTime, endTime, sessionStudentId } = req.body;
    const parentId = req.parentId;
    const sessionStudent = await getSessionStudentService({_id: sessionStudentId});
    if(!sessionStudent) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Student not found"));
    }
    const parent = await getParentService({_id: parentId});
    if(!parent['students']?.some(id => id.equals(sessionStudent.student))) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(400, 'Unauthorized access'));
    }

    const filter = { isActive: true, _id: convertToMongoId(sessionStudentId) };
    const attendanceFilter = {'date': { $gte: Number(startTime), $lte: Number(endTime) }};

    const pipeline = [
      {
        $match: filter,
      },
      {
        $lookup: {
          from: 'sections',
          localField: 'section',
          foreignField: '_id',
          as: 'section',
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$section',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'class',
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$class',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'student',
        },
      },
      {
        $unwind: {
          path: '$student',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'attendances',
          localField: '_id',
          foreignField: 'sessionStudent',
          as: 'attendances',
          pipeline: [
            {
              $match: attendanceFilter,
            },
            {
              $project: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: {$toDate: '$date'},
                    timezone: 'Asia/Kolkata'
                  }
                },
                day: 1,
                parentAttendance: 1,
                teacherAttendance: 1
              }
            }
          ],
        },
      },
      {
        $project: {
          firstname: "$student.firstname",
          lastname: "$student.lastname",
          gender: "$student.gender",
          sectionName: '$section.name',
          className: '$class.name',
          attendances: 1
        },
      },
    ];
    const attendances = await getSessionStudentsPipelineService(pipeline);
    return res.status(StatusCodes.OK).send(success(200, {
      attendances
    }));
    
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getStudentWithAllSessionStudentsController(req, res) {
  try { 
    const studentId = req.params.studentId;
    const student = await getStudentService({_id: studentId, isActive: true});
    if(!student) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Student not found"));
    }

    const pipeline = [
      {
        $match: {
          _id: convertToMongoId(studentId),
          isActive: true
        }
      },
      {
        $lookup: {
          from: "sessionstudents",
          localField: '_id',
          foreignField: 'student',
          as: 'sessionStudents',
          pipeline: [
            {
              $lookup: {
                from: 'sessions',
                localField: 'session',
                foreignField: '_id',
                as: 'session'
              }
            },
            {
              $unwind: {
                path: '$session',
                preserveNullAndEmptyArrays: true,
              }
            },
            {
              $lookup: {
                from: 'classes',
                localField: 'classId',
                foreignField: '_id',
                as: 'classInfo'
              }
            },
            {
              $unwind: {
                path: '$classInfo',
                preserveNullAndEmptyArrays: true,
              }
            },
            {
              $lookup: {
                from: 'sections',
                localField: 'section',
                foreignField: '_id',
                as: 'section'
              }
            },
            {
              $unwind: {
                path: '$section',
                preserveNullAndEmptyArrays: true,
              }
            },
            {
              $addFields: {

                // session
                sessionId: "$session._id",
                sessionName: "$session.name",
                sessionStartDate: "$session.startDate",
                sessionEndDate: "$session.endDate",
                sessionStatus: "$session.status",
                sessionStartYear: "$session.academicStartYear",
                sessionEndYear: "$session.academicEndYear",

                // class
                classId: "$classInfo._id",
                className: "$classInfo.name",

                // section
                sectionId: "$section._id",
                sectionName: "$section.name",
              }
            },
            {
              $project: {
                section: 0,
                session: 0,
                classInfo: 0
              }
            }
          ]
        }
      }
    ];
    const students = await getStudentsPipelineService(pipeline);
    return res.status(StatusCodes.OK).send(success(200, students));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function searchStudentsController(req, res){
  try{
    let { search, page = 1, limit, classId, section, session } = req.query;

    const adminId = req.adminId;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
    const skipNum = (pageNum - 1) * limitNum;
    let filter = {
      school: convertToMongoId(adminId),
      isActive: true
    };

    if(classId) {
      filter['classId'] = convertToMongoId(classId);
    }

    if(section) {
      filter['section'] = convertToMongoId(section);
    }

    if(session) {
      filter['session'] = convertToMongoId(session);
    }

    if(search){
      search = search.trim();
      const[searchFirstname, searchLastname] = search.split(" ");
      if(searchLastname){
      filter['$and'] = [
          { "student.firstname": { $regex: new RegExp(searchFirstname, "i") } },
          { "student.lastname": { $regex: new RegExp(searchLastname, "i") } },
          {isActive: true}
        ];
    } else {
      filter['$or'] = [
        { "student.firstname" : { $regex: new RegExp(search, "i") }, isActive: true },
        { "student.lastname": { $regex: new RegExp(search, "i") }, isActive: true },
        { "schoolParent.email": { $regex: new RegExp(search, "i") }, isActive: true },
        { "schoolParent.phone": { $regex: new RegExp(search, "i") }, isActive: true },
      ];
    }
  }
  const {startTime, endTime} = getStartAndEndTimeService(new Date(), new Date());

    const pipeline = [
        // Join students with parents
        {
          $lookup: {
            from: "students",
            localField: "student",
            foreignField: "_id",
            as: "student",
          }
        },
        {
          $unwind: {
            path: "$student",
            preserveNullAndEmptyArrays: true,
          }
        },
        {
          $lookup: {
            from: "schoolparents",
            localField: "student.schoolParent",
            foreignField: "_id",
            as: "schoolParent"
          }
        },
        {
          $unwind: {
            path: "$schoolParent",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "parents",
            localField: "student.parent",
            foreignField: "_id",
            as: "parent"
          }
        },
        {
          $unwind: {
            path: "$parent",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: filter,
        },
        {
          $sort: { "student.firstname": 1 }
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
            preserveNullAndEmptyArrays: true,
          }
        },
        {
          $lookup: {
            from: "classes",
            localField: "classId",
            foreignField: "_id",
            as: "classInfo"
          }
        },
        {
          $unwind: {
            path: "$classInfo",
            preserveNullAndEmptyArrays: true,
          }
        },
        {
          $lookup: {
            from: 'attendances',
            localField: '_id',
            foreignField: 'sessionStudent',
            as: 'attendances',
            pipeline: [
              { $match: { date: { $gte: startTime, $lte: endTime } } },
              { $project: { date: 1, day: 1, parentAttendance: 1, teacherAttendance: 1 } }
            ]
          }
        },
        {
          $unwind: {
            path: '$attendances',
            preserveNullAndEmptyArrays: true,
          }
        },
        {
          $lookup: {
            from: "sessions",
            localField: "session",
            foreignField: "_id",
            as: "session"
          }
        },
        {
          $unwind: {
            path: "$session",
            preserveNullAndEmptyArrays: true,
          }
        },
        {
          $addFields: {
            id: "$student._id",
            studentId: "$student.studentId",
            rollNumber: "$student.rollNumber",
            firstname: "$student.firstname",
            lastname: "$student.lastname",
            aadharNumber: "$student.aadharNumber",
            dob: "$student.dob",
            gender: "$student.gender",
            bloodGroup: "$student.bloodGroup",
            photo: "$student.photo",
            address: "$student.address",
            city: "$student.city",
            district: "$student.district",
            state: "$student.state",
            country: "$student.country",
            pincode: "$student.pincode",
            guardianName: "$student.guardianName",
            studentCreatedAt: "$student.createdAt",
            studentUpdatedAt: "$student.updatedAt",

            // schoolParent
            parentId: "$schoolParent._id",
            parentFullName: "$schoolParent.fullname",
            parentUsername: "$schoolParent.username",
            parentGender: "$schoolParent.gender",
            parentAge: "$schoolParent.age",
            parentAddress: "$schoolParent.address",
            parentCity: "$schoolParent.city",
            parentDistrict: "$schoolParent.district",
            parentState: "$schoolParent.state",
            parentCountry: "$schoolParent.country",
            parentPincode: "$schoolParent.pincode",
            parentStatus: "$schoolParent.status",
            parentQualification: "$schoolParent.qualification",
            parentOccupation: "$schoolParent.occupation",
            parentPhone: "$schoolParent.phone",
            parentEmail: "$schoolParent.email",
            parentIsLoginAlready: "$schoolParent.isLoginAlready",
            parentCreatedAt: "$schoolParent.createdAt",
            parentUpdatedAt: "$schoolParent.updatedAt",

            // parent (main parent record)
            mainParentId: "$parent._id",
            mainParentFullName: "$parent.fullname",
            mainParentUsername: "$parent.username",
            mainParentGender: "$parent.gender",
            mainParentDob: "$parent.dob",
            mainParentAddress: "$parent.address",
            mainParentCity: "$parent.city",
            mainParentDistrict: "$parent.district",
            mainParentState: "$parent.state",
            mainParentCountry: "$parent.country",
            mainParentPincode: "$parent.pincode",
            mainParentStatus: "$parent.status",
            mainParentQualification: "$parent.qualification",
            mainParentOccupation: "$parent.occupation",
            mainParentPhone: "$parent.phone",
            mainParentEmail: "$parent.email",
            mainParentPhoto: "$parent.photo",
            mainParentFcmToken: "$parent.fcmToken",
            mainParentIsLoginAlready: "$parent.isLoginAlready",
            mainParentStudents: "$parent.students",
            mainParentCreatedAt: "$parent.createdAt",
            mainParentUpdatedAt: "$parent.updatedAt",

            // session
            sessionId: "$session._id",
            sessionName: "$session.name",
            sessionStartDate: "$session.startDate",
            sessionEndDate: "$session.endDate",
            sessionStatus: "$session.status",
            sessionStartYear: "$session.academicStartYear",
            sessionEndYear: "$session.academicEndYear",

            // class
            classId: "$classInfo._id",
            className: "$classInfo.name",

            // section
            sectionId: "$section._id",
            sectionName: "$section.name",

            // attendance
            todayAttendance: "$attendances.teacherAttendance",
          }
        },
        {
          $project: {
            student: 0,
            schoolParent: 0,
            parent: 0,
            section: 0,
            classInfo: 0,
            session: 0,
          }
        }
    ];

    pipeline.push(
      {
        $skip: skipNum,
      },
      {
        $limit: limitNum,
      },
    );

    const students = await getSessionStudentsPipelineService(pipeline);
    const totalStudents = students.length;
    const totalPages = Math.ceil(totalStudents / limitNum);

    await Promise.all(
      students.map((student) =>
        calculateAttendancePercentageForSessionStudent(student._id, student.sessionId).then((percentage) => {
          student.attendancePercentage = percentage;
        }),
      ),
    );

    return res.status(StatusCodes.OK).send(
      success(200, {
        students,
        currentPage: pageNum,
        totalPages,
        totalStudents,
        pageSize: limitNum,
      })
    );
  }  catch (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    }
};

export async function registerStudentsFromExcelController(req, res){
  try {
    const file = req.file;
    const { sectionId, classId, sessionId } = req.body;
    const adminId = req.adminId;

    const [section, classInfo, session] = await Promise.all([
      getSectionService({ _id: sectionId }),
      getClassService({ _id: classId }),
      getSessionService({ _id: sessionId }),
    ]);

    if (!session) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session not found"));
    }

    if (!section) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Section not found"));
    }

    if (!classInfo) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Class not found"));
    }

    if(section["classId"].toString()!==classInfo["_id"].toString()){
      return res.status(StatusCodes.BAD_REQUEST).send(success(400, "Invalid class, section ids"));
    }

    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const students = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    const registeredStudentsCount = await registerStudentsFromExcelHelper(students, sectionId, classId, sessionId, adminId);
    if(registeredStudentsCount===0){
      throw new Error("Student registration failed");
    }
    await fs.unlink(file.path);
    return res.status(StatusCodes.OK).send(success(201,`${registeredStudentsCount} Students registered successfully`));
  } catch(err){
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(501,err.message));
  }
}

export async function getSubjectsForStudentSectionController(req, res) {
  try {
    const sessionStudentId = req.params.sessionStudentId;
    const sessionStudent = await getSessionStudentService({_id: sessionStudentId});
    if(!sessionStudent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session student not found"));
    }
    const pipeline = [
      {
        $match: {
          section: convertToMongoId(sessionStudent.section)
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
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function deleteStudentController(req, res) {
  try {
    const sessionStudentId = req.params.sessionStudentId;
    const sessionStudent = await getSessionStudentService({ _id: sessionStudentId, isActive:true });
    if (!sessionStudent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session Student doesn't exists"));
    }
    const student = await getStudentService({_id: sessionStudent['student']});
    if (!student) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Student doesn't exists"));
    }
  
    const[ parent, section] = await Promise.all([
      getSchoolParentService({ _id:student["schoolParent"], isActive:true }),
      getSectionService({ _id:sessionStudent["section"] })
    ]);

    if (!parent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Parent doesn't exists"));
    }
    
    await Promise.all([
      updateSessionStudentService({_id:sessionStudentId}, {isActive:false}),
      updateSectionService({_id:section["_id"]},{studentCount:section["studentCount"]-1})
    ]);

    const siblings = await getStudentsService({schoolParent:student["schoolParent"], isActive:true});
    if (siblings?.length === 0) {
      await updateSchoolParentService({_id:student["schoolParent"]}, {isActive:false});
    }

    return res.status(StatusCodes.OK).send(success(200, "Student deleted successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}
