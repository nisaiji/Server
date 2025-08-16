import { StatusCodes } from "http-status-codes";
import { getSectionService, updateSectionService } from "../../services/section.services.js";
import { getSessionService } from "../../services/session.services.js";
import { getSessionStudentService, getSessionStudentsPipelineService, registerSessionStudentService } from "../../services/v2/sessionStudent.service.js";
import { error, success } from "../../utills/responseWrapper.js";
import { getClassService } from "../../services/class.sevices.js";
import { getParentService, registerParentService } from "../../services/v2/parent.services.js";
import { getSchoolParentService, registerSchoolParentService, updateSchoolParentService } from "../../services/v2/schoolParent.services.js";
import { getStudentService, getStudentsPipelineService, registerStudentService, updateStudentService } from "../../services/student.service.js";
import { convertToMongoId } from "../../services/mongoose.services.js";
import { getHolidayCountService } from "../../services/holiday.service.js";
import { getWorkDayCountService } from "../../services/workDay.services.js";
import { calculateDaysBetweenDates, calculateSundays } from "../../services/celender.service.js";
import { getAttendanceCountService } from "../../services/attendance.service.js";

export async function registerStudentAndSessionStudentController(req, res) {
  try {
    const { firstname, lastname, gender, parentName, phone, email, qualification, occupation, address, age, parentAddress, parentGender, dob,  sectionId } = req.body;
    const adminId = req.adminId;

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
    const adminId = req.adminId;

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

export async function updateStudentBySchoolController(req, res){
  try {
    const studentId = req.params.studentId;
    const studentUpdate = {};
    const parentUpdate = {};
    const adminId = req.adminId;

    const student = await getStudentService({ _id:studentId });
    if(!student){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Student not found"));
    }
    let schoolParent = await getSchoolParentService({ _id: student["schoolParent"] });
    if(!schoolParent){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Parent not found"));
    }

    if(req.body["firstname"]){ studentUpdate.firstname = req.body["firstname"]; }
    if(req.body["lastname"]){ studentUpdate.lastname = req.body["lastname"]; }
    if(req.body["gender"]){ studentUpdate.gender = req.body["gender"]; }
    if(req.body["bloodGroup"]){ studentUpdate.bloodGroup = req.body["bloodGroup"]; }
    if(req.body["dob"]){ studentUpdate.dob = req.body["dob"]; }
    if(req.body["photo"] || req.body["method"]==="DELETE"){ studentUpdate.photo = (req.body["method"]==="DELETE")? "": req.body["photo"]; }
    if(req.body["address"]){ studentUpdate.address = req.body["address"]; }
    if(req.body["city"]){ studentUpdate.city = req.body["city"]; }
    if(req.body["district"]){ studentUpdate.district = req.body["district"]; }
    if(req.body["state"]){ studentUpdate.state = req.body["state"]; }
    if(req.body["country"]){ studentUpdate.country = req.body["country"]; }
    if(req.body["pincode"]){ studentUpdate.pincode = req.body["pincode"]; }

    if(req.body["phone"] && schoolParent['phone']!==req.body['phone']){
      const phone = req.body['phone'];
      let parent = await getParentService({_id: schoolParent['parent']});
      console.log(parent['students'])
      if (parent && parent['students']?.includes(studentId)) {
        return res.status(StatusCodes.BAD_REQUEST).send(error(400, 'Phone number can not be updated'));
      }
      const schoolParentWithPhone = await getSchoolParentService({ phone, school: student['adminId'], isActive:true, _id: { $ne: schoolParent["_id"] } });
      const parentWithPhone = await getParentService({ phone, isActive:true, _id: {$ne: schoolParent['parent']}});
      if(parentWithPhone || schoolParentWithPhone){
        return res.status(StatusCodes.CONFLICT).send(error(409, "Phone number already registered"));
      }
      if(phone!==schoolParent['phone']) {
        parent = await registerParentService({phone, status: 'unVerified'});
        schoolParent = await registerSchoolParentService({phone, school: adminId, parent: parent['_id']});
       studentUpdate['schoolParent'] = schoolParent['_id'];
      }
    }
    if(req.body["parentName"]){ parentUpdate.fullname = req.body["parentName"]; }
    if(req.body["parentGender"]){ parentUpdate.gender = req.body["parentGender"]; }
    if(req.body["parentAge"]){ parentUpdate.age = req.body["parentAge"]; }
    if(req.body["parentEmail"]){ parentUpdate.email = req.body["parentEmail"]; }
    if(req.body["parentQualification"]){ parentUpdate.qualification = req.body["parentQualification"]; }
    if(req.body["parentOccupation"]){ parentUpdate.occupation = req.body["parentOccupation"]; }
    if(req.body["parentAddress"]){ parentUpdate.address = req.body["parentAddress"]; }
    if(req.body["parentCity"]){ parentUpdate.city = req.body["parentCity"]; }
    if(req.body["parentDistrict"]){ parentUpdate.district = req.body["parentDistrict"]; }
    if(req.body["parentState"]){ parentUpdate.state = req.body["parentState"]; }
    if(req.body["parentCountry"]){ parentUpdate.country = req.body["parentCountry"]; }
    if(req.body["parentPincode"]){ parentUpdate.pincode = req.body["parentPincode"]; }


    await Promise.all([
      updateStudentService({ _id:studentId }, studentUpdate),
      updateSchoolParentService({ _id: schoolParent["_id"] }, parentUpdate)
    ]);
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
    
    const student = await getStudentService({ _id:studentId });
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

    if(req.body["firstname"]){ studentUpdate.firstname = req.body["firstname"]; }
    if(req.body["lastname"]){ studentUpdate.lastname = req.body["lastname"]; }
    if(req.body["gender"]){ studentUpdate.gender = req.body["gender"]; }
    if(req.body["bloodGroup"]){ studentUpdate.bloodGroup = req.body["bloodGroup"]; }
    if(req.body["dob"]){ studentUpdate.dob = req.body["dob"]; }
    if(req.body["photo"] || req.body["method"]==="DELETE"){ studentUpdate.photo = (req.body["method"]==="DELETE")? "": req.body["photo"]; }    if(req.body["address"]){ studentUpdate.address = req.body["address"]; }
    if(req.body["address"]){ studentUpdate.address = req.body["address"]; }
    if(req.body["city"]){ studentUpdate.city = req.body["city"]; }
    if(req.body["district"]){ studentUpdate.district = req.body["district"]; }
    if(req.body["state"]){ studentUpdate.state = req.body["state"]; }
    if(req.body["country"]){ studentUpdate.country = req.body["country"]; }
    if(req.body["pincode"]){ studentUpdate.pincode = req.body["pincode"]; }

    await updateStudentService({ _id:studentId }, studentUpdate);
    return res.status(StatusCodes.OK).send(success(200, "Student updated successfully"));    
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(501,err.message))
  }
}

export async function getSessionStudentSController(req,res) {
  try {
    let {school, session, classId, section, sessionStudentId, startDate, endDate, include, page = 1, limit } = req.query;
    const filter = {school: convertToMongoId(school), session: convertToMongoId(session)};
    if(classId) filter['classId']= convertToMongoId(classId);
    if(section) filter['section']= convertToMongoId(section);
    if(sessionStudentId) filter['_id'] = convertToMongoId(sessionStudentId);

    const pipeline = [
      {
        $match: filter
      },
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'student'
        }
      },
      {
        $unwind: {
          path: '$student',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'schoolparents',
          localField: 'student.schoolParent',
          foreignField: '_id',
          as: 'schoolParent'
        }
      },
      {
        $unwind: {
          path: '$schoolParent',
          preserveNullAndEmptyArrays: true,
        }
      },
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
          studentId: "$student._id",
          studentFirstName: "$student.firstname",
          studentLastName: "$student.lastname",
          studentDob: "$student.dob",
          studentGender: "$student.gender",
          studentBloodGroup: "$student.bloodGroup",
          studentPhoto: "$student.photo",
          studentAddress: "$student.address",
          studentCity: "$student.city",
          studentDistrict: "$student.district",
          studentState: "$student.state",
          studentCountry: "$student.country",
          studentPincode: "$student.pincode",

          // schoolParent
          parentId: "$schoolParent._id",
          parentFullName: "$schoolParent.fullname",
          parentGender: "$schoolParent.gender",
          parentAddress: "$schoolParent.address",
          parentCity: "$schoolParent.city",
          parentDistrict: "$schoolParent.disctrict",
          parentStatus: "$schoolParent.status",
          parentQualification: "$schoolParent.qualification",
          parentOccupation: "$schoolParent.occupation",
          parentPhone: "$schoolParent.phone",
          parentEmail: "$schoolParent.email",

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
          student: 0,
          schoolParent: 0,
          section: 0,
          session: 0,
          classInfo: 0
        }
      }
    ]
    const sessionStudents = await getSessionStudentsPipelineService(pipeline);
    for (let student of sessionStudents) {
      student.attendancePercentage = await calculateAttendancePercentage(student._id, student.sessionId);
    }
    return res.status(StatusCodes.OK).send(success(200, sessionStudents));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getAttendancesController(req, res){
  try {
    let { startTime, endTime, sessionStudentId } = req.body;
    const parentId = req.parentId;
    const sessionStudent = await getSessionStudentService({_id: sessionStudentId});
    if(!student) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Student not found"))
    }
    const parent = await getParentService({_id: parentId})
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
          attendances: 1,
          student: 0
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
    const student = await getStudentService({_id: studentId});
    if(!student) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Student not found"));
    }

    const pipeline = [
      {
        $match: {
          _id: convertToMongoId(studentId),
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

async function calculateAttendancePercentage(sessionStudentId, sessionId) {
  try {
    const session = await getSessionService({_id: convertToMongoId(sessionId)})
   console.log({session})
    const startTime = session['startDate'].getTime();
    const endTime = session['endDate'].getTime();

    const currentDate = new Date().getTime();
    const holidaysCount = await getHolidayCountService({ admin: session['school'], date: { $gte: startTime, $lte: currentDate } });
    const sundayCount = calculateSundays(startTime, currentDate);
    const sundayAsWorkDayCount = await getWorkDayCountService({ admin: session['school'], date: { $gte: startTime, $lte: currentDate } });
    const dayscount = calculateDaysBetweenDates(startTime, currentDate);
    const attendancableDays = dayscount - holidaysCount - sundayCount + sundayAsWorkDayCount;
    const presentDaysCount = await getAttendanceCountService({sessionStudent: convertToMongoId(sessionStudentId), teacherAttendance: "present", date: { $gte: startTime, $lte: currentDate }});
    return (presentDaysCount/attendancableDays)*100;
  } catch (error) {
    throw error;
  }
}
