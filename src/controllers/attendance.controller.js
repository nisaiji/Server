import { createSectionAttendanceService, deleteSectionAttendanceService, getSectionAttendanceService, getSectionAttendancesService, getSectionAttendanceStatusService, updateSectionAttendanceService } from "../services/sectionAttendance.services.js";
import {createAttendanceService,getAttendanceService, getAttendancesService, updateAttendanceService, getMisMatchAttendanceService, getAttendancePipelineService, deleteAttendancesService} from "../services/attendance.service.js";
import {getParentsByStudentId, getStudentService, getStudentsPipelineService} from "../services/student.service.js";
import { error, success } from "../utills/responseWrapper.js";
import { StatusCodes } from "http-status-codes";
import { getSectionByIdService, getSectionService } from "../services/section.services.js";
import { getTeacherService } from "../services/teacher.services.js";
import { getDayNameService, getFormattedDateService, getStartAndEndTimeService } from "../services/celender.service.js";
import { getHolidayService } from "../services/holiday.service.js";
import { convertToMongoId } from "../services/mongoose.services.js";
import { attendanceControllerResponse } from "../config/httpResponse.js";
import { getWorkDayService } from "../services/workDay.services.js";
import { sendPushNotification } from "../config/firebase.config.js";
import { getSessionStudentService, getSessionStudentsPipelineService } from "../services/v2/sessionStudent.service.js";
import { getSessionService } from "../services/session.services.js";

export async function attendanceByTeacherController(req, res) { 
  try {
    const { sectionId, present, absent } = req.body;
    const teacherId = req.teacherId;
    const adminId = req.adminId;
    const section = await getSectionService({ _id: sectionId })
    const session = await getSessionService({_id:section["session"]});
    if(!session || session['status']==='completed') {
      return res.status(StatusCodes.BAD_REQUEST).send(error(404, "Session completed! Can't mark attendance")); 
    }
    if(!section){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, attendanceControllerResponse.attendanceByTeacherController.sectionNotFound))
    }

    if(section["guestTeacher"] && section["guestTeacher"]?.toString()!==teacherId){
      return res.status(StatusCodes.UNAUTHORIZED).send(error(404, attendanceControllerResponse.attendanceByTeacherController.teacherUnauthorized))
    }
    let date = new Date();
    const { startTime, endTime } = getStartAndEndTimeService(date, date);

    if(present.length==0 && absent.length==0){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, attendanceControllerResponse.attendanceByTeacherController.noStudents));
    }
    
    const day = getDayNameService(date.getDay());
    date = date.getTime();
    if (day === "Sunday") {
      const sundayAsWorkDay = await getWorkDayService({date: {$gte: startTime, $lte: endTime}, admin: adminId});
      if(!sundayAsWorkDay) {
        return res.status(StatusCodes.CONFLICT).send(error(409, attendanceControllerResponse.attendanceByTeacherController.todayIsSunday));
      }
    }

    const holiday = await getHolidayService({date:{$gte:startTime,$lte:endTime}, admin:adminId });
    if (holiday) {
      return res.status(StatusCodes.CONFLICT).send(error(409, attendanceControllerResponse.attendanceByTeacherController.scheduledHoliday));
    }
    const sectionAttendance = await getSectionAttendanceService({section:sectionId, date:{$gte:startTime,$lte:endTime}})
    if(sectionAttendance){
      return res.status(StatusCodes.CONFLICT).send(error(409, attendanceControllerResponse.attendanceByTeacherController.attendanceAlreadyMarked));
    }

    for (const sessionStudent of present) {
      try {
        const paramObj = {"sessionStudent":sessionStudent["id"], date:{$gte:startTime, $lte:endTime}, parentAttendance: {$ne:""}};
        const parentMarkedAttendance = await getAttendanceService(paramObj);
        const storedSessionStudent = await getSessionStudentService({_id: sessionStudent['id']});

        if(parentMarkedAttendance){
          const id = parentMarkedAttendance["id"];
          const fieldsToBeUpdated = {teacherAttendance:"present", section:sectionId, classId:section['classId'], admin:adminId};
          await updateAttendanceService({_id: id}, fieldsToBeUpdated);
        }else{
          const attendanceObj = {date, day, sessionStudent:sessionStudent["id"], student:storedSessionStudent['student'], teacherAttendance:"present", section:sectionId, classId:section['classId'], session: section['session'], admin:adminId};
          await createAttendanceService(attendanceObj);
        }
        const studentWithParent = await getParentsByStudentId([storedSessionStudent['student']]);
        await sendPushNotification(studentWithParent[0]?.parent?.['fcmToken'], `Attendance`, ` ${studentWithParent[0]?.firstname} ${studentWithParent[0]?.lastname} is present today ${getFormattedDateService(new Date())}` )
      } catch (error) {
        throw error;
      }
   };

    for(const sessionStudent of absent) {
      try {
        const paramObj = {sessionStudent:sessionStudent["id"], date:{$gte:startTime, $lte:endTime}, parentAttendance: {$ne:""}};
        const parentMarkedAttendance = await getAttendanceService(paramObj);
        const storedSessionStudent = await getSessionStudentService({_id: sessionStudent['id']});

        if(parentMarkedAttendance){
          const id = parentMarkedAttendance["id"];
          const fieldsToBeUpdated = {teacherAttendance:"present", section:sectionId, classId:section['classId'], admin:adminId};
          await updateAttendanceService({_id: id}, fieldsToBeUpdated);
        }else{
          const attendanceObj = {date, day, sessionStudent:sessionStudent["id"], student: storedSessionStudent['student'], teacherAttendance:"absent", section:sectionId, session: section['session'], classId:section['classId'], admin:adminId};
          await createAttendanceService(attendanceObj);
        }
        const studentWithParent = await getParentsByStudentId([storedSessionStudent['student']]);
        await sendPushNotification(studentWithParent[0]?.parent['fcmToken'], `Attendance`, `${studentWithParent[0]?.firstname} ${studentWithParent[0]?.lastname} is absent today ${getFormattedDateService(new Date())}` )
      } catch (error) {
        throw error;
      }
   };

    const presentCount = present?.length;
    const absentCount = absent?.length;
    await createSectionAttendanceService({date, section:sectionId, teacher:teacherId, presentCount, absentCount, status:"completed"});
    return res.status(StatusCodes.OK).send(success(200, attendanceControllerResponse.attendanceByTeacherController.attendanceMarkedSuccessfully));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function undoAttendanceByTeacherController(req, res) {
  const { sectionId } = req.body;
  let date = new Date();
  const { startTime, endTime } = getStartAndEndTimeService(date, date);
  const sectionAttendance = await getSectionAttendanceService({section:sectionId, date:{$gte:startTime,$lte:endTime}})
  if(!sectionAttendance){
    return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Attendance is not marked yet"));
  }
  await deleteSectionAttendanceService({_id: sectionAttendance['_id']});
  const result = await deleteAttendancesService({section: sectionId, date:{$gte:startTime,$lte:endTime}})
  console.log({result, sectionAttendance})
  return res.status(StatusCodes.OK).send(success(200, "Attendance for today deleted successfully"));  
}

export async function attendanceByParentController(req, res) {
  try {
    const { studentId, attendance} = req.body;
    const parentId = req.parentId;
    let date = new Date();
    const{startTime, endTime} = getStartAndEndTimeService(date, date);    
    
    if(!(attendance==="present" || attendance==="absent")){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, attendanceControllerResponse.attendanceByParentController.invalidAttendanceValue));
    }

    const student = await getStudentService({_id:studentId, isActive:true});
    if(!student){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, attendanceControllerResponse.attendanceByParentController.studentNotFound));
    }
    if((student["parent"].toString())!==parentId){
      return res.status(StatusCodes.UNAUTHORIZED).send(error(401, attendanceControllerResponse.attendanceByParentController.unauthorizedParent));
    }
    
    const day = getDayNameService(date.getDay());
    date = date.getTime();
    
    if (day === "Sunday"){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, attendanceControllerResponse.attendanceByParentController.todayIsSunday));
    }

    const [attendanceMarkedByTeacher, attendanceMarkedByParent, holiday] = await Promise.all([
      getAttendanceService({student:studentId, date:{$gte:startTime,$lte:endTime}, teacherAttendance:{$ne:""}}),
      getAttendanceService({student:studentId, date: {$gte:startTime,$lte:endTime},parentAttendance:{$ne:""}}),
      getHolidayService({date: {$gte:startTime,$lte:endTime}, admin:student['admin'] })
    ]) ;

    if (holiday) {
      return res.status(StatusCodes.CONFLICT).send(error(409, attendanceControllerResponse.attendanceByParentController.scheduledHoliday));
    }

    if(attendanceMarkedByTeacher){
      return res.status(StatusCodes.CONFLICT).send(error(409, attendanceControllerResponse.attendanceByParentController.parentCantMarkAttendance));
    }

    if(attendanceMarkedByParent){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400,attendanceControllerResponse.attendanceByParentController.attendanceAlreadyMarkedByParent));
    }

    const markAttendance = await createAttendanceService({student:studentId,date,day,parentAttendance:attendance});
    if(markAttendance instanceof Error){
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(400, attendanceControllerResponse.attendanceByParentController.parentUnableToMarkAttendance));
    }
    return res.status(StatusCodes.OK).send(success(200, attendanceControllerResponse.attendanceByParentController.attendanceMarkedSuccessfully));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function bulkAttendanceMarkController(req, res) {
  try {
    const sectionId = req.params.sectionId;
    const { studentsAttendances } = req.body;
    const adminId = req.adminId;
    const teacherId = req.teacherId;
    const role = req.role;

    const section = await getSectionService({ _id: sectionId })
    if(!section){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Section not found"))
    }

    const session = await getSessionService({_id:section["session"]});
    if(!session || session['status']==='completed') {
      return res.status(StatusCodes.BAD_REQUEST).send(error(404, "Session completed! Can't mark attendance")); 
    }

    if(role==='guestTeacher'){
      return res.status(StatusCodes.UNAUTHORIZED).send(error(404, "Teacher is unauthorized"))
    }

    if(role==='teacher' && teacherId){
      const teacher = await getTeacherService({_id: teacherId})
      if(!teacher){
        return res.status(StatusCodes.UNAUTHORIZED).send(error(404, "Teacher not exists"));
      }
      if(sectionId.toString()!==teacher['section'].toString()){
        return res.status(StatusCodes.UNAUTHORIZED).send(error(404, "Teacher is unauthorized"));
      }
    }

    for (let attendanceTimestamp in studentsAttendances) {
      attendanceTimestamp = parseInt(attendanceTimestamp)
      if(attendanceTimestamp < section['startTime']){
        continue;
      }
      let presentCount = 0;
      let absentCount = 0; 
      const formattedDate = new Date(attendanceTimestamp);
      const dayName = getDayNameService(formattedDate.getDay());
      const { startTime, endTime } = getStartAndEndTimeService(formattedDate, formattedDate);
      const sectionAttendance = await getSectionAttendanceService({section: sectionId, date : {$gte: startTime, $lte: endTime}});
      const holiday = await getHolidayService({ date: { $gte: startTime, $lte: endTime }, admin: adminId });
      if (holiday || attendanceTimestamp > new Date().getTime()) {
        continue;
      }

      if(dayName==='Sunday') {
        const sundayAsWorkDay = await getWorkDayService({date: {$gte: startTime, $lte: endTime}, admin: adminId});
        if(!sundayAsWorkDay) {
          continue;
        }
      }

      for (const studentAttendance of studentsAttendances[attendanceTimestamp]) {
        if(!['present', 'absent'].includes(studentAttendance['attendance'])){
          continue;
        }
        const existingAttendance = await getAttendanceService({ student: studentAttendance['student'], date: { $gte: startTime, $lte: endTime } });
        if (existingAttendance) {
          await updateAttendanceService({ _id: existingAttendance["_id"] }, { teacherAttendance: studentAttendance['attendance'] });
        } else {
          const attendanceObj = { date:attendanceTimestamp, day:dayName, student: studentAttendance['student'], teacherAttendance: studentAttendance['attendance'], section: sectionId, classId: section['classId'], admin: adminId };
          await createAttendanceService(attendanceObj);
        }

        if(studentAttendance['attendance']==='present'){
          presentCount+=1;
        } else {
          absentCount+=1;
        }
      }
      if(presentCount===0 && absentCount===0){
        continue;
      }
      if(sectionAttendance){
        await updateSectionAttendanceService({_id: sectionAttendance['_id']}, {presentCount, absentCount, teacher: teacherId?teacherId:adminId})
      } else {
        await createSectionAttendanceService({section: sectionId, presentCount, absentCount, date: attendanceTimestamp, teacher:teacherId?teacherId:adminId, status:'completed'})
      }
    }

    return res.status(StatusCodes.OK).send(success(200, "Attendance marked successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500,err.message));
  }
}

export async function getMisMatchAttendanceController(req,res){
  try {
    const sectionId = req.sectionId;
    let date = new Date();
    const{startTime, endTime} = getStartAndEndTimeService(date, date);
    const day = getDayNameService(date.getDay());
    date = date.getTime();
    if (day === "Sunday") {
      return res.status(StatusCodes.CONFLICT).send(error(400, "Today is Sunday"));
    }
 
    const attendances = await getMisMatchAttendanceService({section:sectionId,startTime,endTime});
    return res.status(StatusCodes.OK).send(success(200,{attendances}));    
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500,err.message));
  }
}

export async function updateAttendanceController(req,res){
  try {
    const{present,absent} = req.body;
    const teacherId = req.teacherId;
    const teacher = await getTeacherService({_id:teacherId, isActive:true});
    const sectionId = teacher["section"];
    const section = await getSectionService({_id:sectionId});
    if(!section){
      return res.status(StatusCodes.NOT_FOUND).send(error(404,"Section not found"));
    }
    const session = await getSessionService({_id:section["session"]});
    if(!session || session['status']==='completed') { 
      return res.status(StatusCodes.BAD_REQUEST).send(error(404, "Session completed! Can't update attendance")); 
    }

    const date = new Date();
    const {startTime, endTime} = getStartAndEndTimeService(date, date);

    const presentLength = present?.length;
    for(let i=0;i<presentLength; i++){
      const id = present[i]["_id"];
      const fieldsToBeUpdated = {teacherAttendance:"present"}
      await updateAttendanceService({_id: id}, fieldsToBeUpdated);
    }
    
    const absentLength = absent?.length;
    for(let i=0;i<absentLength; i++){
      const id = absent[i]["_id"];
      const fieldsToBeUpdated = {teacherAttendance:"absent"}
      await updateAttendanceService({_id: id}, fieldsToBeUpdated);
    }


    const sectionAttendance = await getSectionAttendanceService({section:sectionId, date:{$gte: startTime, $lte: endTime}});
    sectionAttendance["presentCount"] = sectionAttendance["presentCount"]-absentLength+presentLength;
    sectionAttendance["absentCount"] = sectionAttendance["absentCount"]-presentLength+absentLength;
    await sectionAttendance.save();
    return res.send(success(200,"Attendance updated successfully"))
  } catch (err) {
    return res.send(error(500,err.message)) ;   
  }
}

export async function checkAttendaceMarkedController(req, res) {
  try {
    const adminId = req.adminId;
    const sectionId = (req.sectionId)?(req.sectionId):(req.params.sectionId);
    if(!sectionId){
      return res.status(StatusCodes.BAD_GATEWAY).send(error(502, "Section id is required"));
    }
    const section = await getSectionService({_id: sectionId});
    if(!section){
      return res.status(StatusCodes.NOT_FOUND).send(error(502, "Section not found"));
    }
    if(section['guestTeacher'] && req.role==='teacher'){
      return res.status(StatusCodes.UNAUTHORIZED).send(error(401, "Teacher is not authorized for attendance"))
    }
    let date = new Date();
    const {startTime, endTime} = getStartAndEndTimeService(date, date);

    const holiday = await getHolidayService({date:{$gte:startTime,$lte:endTime}, admin:adminId });
    if (holiday) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Today is scheduled as holiday!"));
    }
    const day = getDayNameService(date.getDay());
    date = date.getTime();
    if (day === "Sunday") {
      const sundayAsWorkDay = await getWorkDayService({date: {$gte: startTime, $lte: endTime}, admin: adminId});
      if(!sundayAsWorkDay) {
        return res.status(StatusCodes.CONFLICT).send(error(409, "Today is Sunday"));
      }
    }

    const sectionAttendance = await getSectionAttendanceService({section:sectionId, date:{$gte:startTime, $lte:endTime}});

    if (sectionAttendance) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Attendance already marked"));
    }
    return res.status(StatusCodes.OK).send(success(200, "Attendance haven't marked today"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function checkParentAttendaceMarkedController(req, res) {
  try {
    const studentId = req.params.studentId;
    const parentId = req.parentId;
    const date = new Date();
    const{startTime, endTime} = getStartAndEndTimeService(date, date);

    const student = await getStudentService({parent: parentId, isActive:true});
    if(!student){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "student not found"));
    }
 
    const holiday = await getHolidayService({ admin:student['admin'],date:{$gte:startTime, $lte:endTime}});
    if (holiday) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Today is scheduled as holiday!"));
    }

    const day = getDayNameService(date.getDay());
    if (day === "Sunday") {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Today is Sunday"));
    }

    const attendance = await getAttendanceService({student:studentId, date:{$gte:startTime, $lte:endTime}, parentAttendance:{$ne:""}});
    const parentAttendance = attendance?attendance["parentAttendance"]:null;
    const teacherAttendance = attendance?attendance["teacherAttendance"]:null;

    return res.send(success(200, {parentAttendance,teacherAttendance}));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function attendanceStatusOfSectionController(req, res) {
  try {
    const sectionId = req.sectionId;
    const {startTime, endTime} = req.body;
 
    const section = await getSectionByIdService(sectionId);
    const totalStudent = section["studentCount"];
    const sectionAttendance = await getSectionAttendanceStatusService({date:{$gte: startTime, $lte: endTime}, section:sectionId})

    return res.status(StatusCodes.OK).send(success(200, {section:sectionId, totalStudent, sectionAttendance}));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function attendanceStatusOfStudentController(req, res) {
  try {
    const studentId = req.params.studentId;
    let {startTime, endTime} = req.body;

    const student = await getStudentService({_id:studentId, isActive:true});
    if(!student){
      return res.status(StatusCodes.NOT_FOUND).send(error(404,"Student not found"));
    }
    const attendance = await getAttendancesService({student:studentId, date:{$gte:startTime, $lte:endTime}});
    return res.status(StatusCodes.OK).send(success(200, {attendance}));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function attendanceCountOfStudentController(req, res){
  try { 
    let{ studentId, startTime, endTime } = req.body; 

    const student = await getStudentService({_id:studentId});
    if(!student){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Student not found"));
    }

    const [studentPresentAttendance, studentAbsentAttendance, sectionAttendance] = await Promise.all([
      getAttendancesService({student:studentId, teacherAttendance:"present", date:{$gte: startTime, $lte:endTime}}),
      getAttendancesService({student:studentId, teacherAttendance:"absent", date:{$gte: startTime, $lte:endTime}}),
      getSectionAttendancesService({section:student["section"], date:{$gte:startTime, $lte:endTime}})
    ]);

    const studentPresentAttendanceCount = studentPresentAttendance.length;
    const studentAbsentAttendanceCount = studentAbsentAttendance.length;
    const sectionAttendanceCount = sectionAttendance.length;
  
    return res.status(StatusCodes.OK).send(success(200,{studentPresentAttendanceCount, studentAbsentAttendanceCount, sectionAttendanceCount}));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getAttendancesController(req, res){
  try {
    let { startTime, endTime, sessionStudent, session, section, classId, admin } = req.query;
    const filter = {isActive: true}
    const attendanceFilter = {}
    const role = req.role;
    if(role === 'guestTeacher'){
      return res.status(StatusCodes.FORBIDDEN).send(error(403, "Guest teacher not authorized"));
    }
    if(role ==='teacher'){
      classId = null;
      admin = null;
      section = req.sectionId;
    }
    if(sessionStudent){ filter['_id'] = convertToMongoId(sessionStudent) }
    if(section) { filter['section'] = convertToMongoId(section) }
    if(session) { filter['session'] = convertToMongoId(session) }
    if(classId){ filter['classId'] = convertToMongoId(classId) }
    if(admin){ filter['school'] = convertToMongoId(admin) }
    if(startTime && endTime){
      attendanceFilter['date'] = { $gte: Number(startTime), $lte: Number(endTime) }
    }

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
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'student'
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
          firstname: '$student.firstname',
          lastname: '$student.lastname',
          gender: '$student.gender',
          sectionName: '$section.name',
          className: '$class.name',
          attendances: 1,
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
