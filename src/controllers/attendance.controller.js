import { createSectionAttendanceService, getSectionAttendanceService, getSectionAttendancesService, getSectionAttendanceStatusService } from "../services/sectionAttendance.services.js";
import {createAttendanceService,findAttendanceById,getAttendanceService,getHolidayEventService,getAttendancesService, updateAttendance, updateAttendanceService, getMisMatchAttendanceService} from "../services/attendance.service.js";
import {getStudentService} from "../services/student.service.js";
import { error, success } from "../utills/responseWrapper.js";
import { StatusCodes } from "http-status-codes";
import { getSectionByIdService } from "../services/section.services.js";
import { getTeacherService } from "../services/teacher.services.js";
 
export async function attendanceByTeacherController(req, res) { 
  try {
    const {sectionId, present, absent} = req.body;
    const teacherId = req.teacherId;
    const adminId = req.adminId;
    const date = new Date();
    const currDate = date.getTime();
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();

    if(present.length==0 && absent.length==0){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400,"No student provided"));
    }

    const daysOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday",];
    const day = daysOfWeek[date.getDay()];

    if (day === "Sunday") {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Today is sunday"));
    }

    const holiday = await getHolidayEventService({date: {$gte:startOfDay,$lte:endOfDay},admin:adminId,holiday: true});
    if (holiday) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Today is scheduled as holiday!"));
    }
    const sectionAttendance = await getSectionAttendanceService({section:sectionId, date:{$gte:startOfDay,$lte:endOfDay}})
    if(sectionAttendance){
      return res.status(StatusCodes.CONFLICT).send(error(409, "Attendance already marked"));
    }

    present.map(async (student) => {
      const paramObj = {student:student["_id"], date:{$gte:startOfDay, $lte:endOfDay}, parentAttendance: {$ne:""}};
      const parentMarkedAttendance = await getAttendanceService(paramObj);

      if(parentMarkedAttendance){
        const attendanceObj = {attendanceId:parentMarkedAttendance["_id"], teacherAttendance:"present", section:sectionId, teacher:teacherId, admin:adminId};
        await updateAttendanceService(attendanceObj);
      }else{
        const attendanceObj = {date:currDate, day, student:student["_id"], teacherAttendance:"present", section:sectionId, teacher:teacherId, admin:adminId};
        await createAttendanceService(attendanceObj);
      }
    });

    absent.map(async (student) => {
      const paramObj = {student:student["_id"], date:{$gte:startOfDay, $lte:endOfDay}, parentAttendance: {$ne:""}};
      const parentMarkedAttendance = await getAttendanceService(paramObj);

      if(parentMarkedAttendance){
        const attendanceObj = {attendanceId:parentMarkedAttendance["_id"], teacherAttendance:"absent", section:sectionId, teacher:teacherId, admin:adminId};
        await updateAttendanceService(attendanceObj);
      }else{
        const attendanceObj = {date:currDate, day, student:student["_id"], teacherAttendance:"absent", section:sectionId, teacher:teacherId, admin:adminId};
        await createAttendanceService(attendanceObj);
      }
    });

    const presentCount = present?.length;
    const absentCount = absent?.length;
    await createSectionAttendanceService({date:currDate, section:sectionId, teacher:teacherId, presentCount, absentCount, status:"completed"});
    return res.status(StatusCodes.OK).send(success(200, "Attendance marked successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function attendanceByParentController(req, res) {
  try {
    const { studentId, attendance} = req.body;
    const parentId = req.parentId;
    const adminId = req.adminId;
    const date = new Date();
    const currDate = date.getTime();
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();


    if(!(attendance==="present" || attendance==="absent")){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400,"Invalid attendance value"));
    }

    const student = await getStudentService({_id:studentId, isActive:true});
    if(!student){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "student not found"));
    }
    if((student["parent"].toString())!==parentId){
      return res.status(StatusCodes.UNAUTHORIZED).send(error(401, "Parent is not authorized to mark attendance."));
    }

    const daysOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday",];
    const day = daysOfWeek[date.getDay()];
    if (day === "Sunday"){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Today is sunday"));
    }

    const holidayEvent = await getHolidayEventService({date: {$gte:startOfDay,$lte:endOfDay}, admin:adminId, holiday: true});
    if (holidayEvent) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Today is scheduled as holiday!"));
    }
    const attendanceMarkedByTeacher = await  getAttendanceService({student:studentId, date:{$gte:startOfDay,$lte:endOfDay}});
    if(attendanceMarkedByTeacher){
      return res.status(StatusCodes.CONFLICT).send(error(409, "Parent can't mark attendance,teacher already marked."));
    }
    const attendanceMarkedByParent = await getAttendanceService({student:studentId, date: {$gte:startOfDay,$lte:endOfDay},parentAttendance:{$ne:""}});
    if(attendanceMarkedByParent){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400,"Attendance already marked by parent"));
    }
    const markAttendance = await createAttendanceService({student:studentId,date:currDate,day,parentAttendance:attendance});
    if(markAttendance instanceof Error){
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(400,"Parent is unable to mark attendance"));
    }
    return res.status(StatusCodes.OK).send(success(200, "Attendance marked sucessfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getMisMatchAttendanceController(req,res){
  try {
    const sectionId = req.sectionId;
    const date = new Date();
    const currDate = date.getTime();
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();
    const daysOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday",];
    const day = daysOfWeek[date.getDay()];
    if (day === "Sunday") {
      return res.status(StatusCodes.CONFLICT).send(error(400, "Today is sunday"));
    }
 
    const attendances = await getMisMatchAttendanceService({section:sectionId,startOfDay,endOfDay});
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

    const date = new Date();
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();

    const presentLength = present?.length;
    for(let i=0;i<presentLength; i++){
      const attendanceInstance = await findAttendanceById(present[i]["attendanceId"]);
      await updateAttendance({attendanceId:present[i]["attendanceId"],attendance:"present"});
    }
    
    const absentLength = absent?.length;
    for(let i=0;i<absentLength; i++){
      const attendanceInstance = await findAttendanceById(absent[i]["attendanceId"]);
      await updateAttendance({attendanceId:absent[i]["attendanceId"],attendance:"absent"});
    }


    const sectionAttendance = await getSectionAttendanceService({section:sectionId, date:{$gte: startOfDay, $lte: endOfDay}});
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
      return res.status(StatusCodes.BAD_GATEWAY).send(error(502, "Section id is required."));
    }
    const date = new Date();

    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();

    const holidayEvent = await getHolidayEventService({admin:adminId,startOfDay,endOfDay });
    if (holidayEvent) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Today is scheduled as holiday!"));
    }

    const sectionAttendance = await getSectionAttendanceService({section:sectionId, startOfDay, endOfDay});

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
    const adminId = req.adminId;
    const date = new Date();
    const currDate = date.getTime();
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();
 
    const holidayEvent = await checkHolidayEvent({ adminId,startOfDay,endOfDay});
    if (holidayEvent) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Today is scheduled as holiday!"));
    }
    const attendance = await getAttendanceService({student:studentId, startOfDay, endOfDay, parentAttendance:{$ne:""}});
    const parentAttendance = attendance?attendance["parentAttendance"]:null;
    const teacherAttendance = attendance?attendance["teacherAttendance"]:null;

    return res.send(success(200, {parentAttendance,teacherAttendance}));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function attendanceStatusOfSectionController(req, res) {
  try {
    const {sectionId, startTime, endTime} = req.body;
 
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
    const {startTime, endTime} = req.body;

    const student = await getStudentService({_id:studentId, isActive:true});
    if(!student){
      return res.error(StatusCodes.NOT_FOUND).send(error(404,"Student not found"));
    }
    const attendance = await getAttendancesService({student:studentId, date:{$gte:startTime, $lte:endTime}});
    return res.status(StatusCodes.OK).send(success(200, {attendance}));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function attendanceCountOfStudentController(req, res){
  try { 
    const{studentId, startTime, endTime} = req.body;

    const student = await getStudentService({_id:studentId});
    if(!student){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Student not found"));
    }

    const studentAttendance = await getAttendancesService({student:studentId, data:{$gte: startTime, $lte:endTime}});
    const sectionAttendance = await getSectionAttendancesService({section:student["section"], date:{$gte:startTime, $lte:endTime}});

    const studentAttendanceCount = studentAttendance.length;
    const sectionAttendanceCount = sectionAttendance.length;

    return res.status(StatusCodes.OK).send(success(200,{studentAttendanceCount, sectionAttendanceCount}));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

// export async function attendanceDailyStatusController(req, res) {
//   try {
//     const sectionId = req.params.sectionId;

//     const date = new Date();
//     const currDate = date.getTime();
//     const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
//     const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();
 
//     const section = await getSectionByIdService(sectionId);
//     const sectionAttendance = await getSectionAttendanceService({date:})
//     const totalStudentCount = section?.studentCount;
//     const presentStudentCount = await getPresentStudentCount({sectionId,startOfDay,endOfDay});
//     const absentStudentCount = await getAbsentStudentCount({sectionId,startOfDay,endOfDay});
//     return res.send(success(200, {totalStudentCount,presentStudentCount,absentStudentCount,}));
//   } catch (err) {
//     return res.send(error(500, err.message));
//   }
// }

// export async function attendanceWeeklyStatusController(req, res) {
//   try {
//     const sectionId = req.params.sectionId;
//     const date = new Date();
//     const { monday, sunday } = date.getWeekDates();

//     const weekDates = [];
//     let currentDate = new Date(monday);
//     while (currentDate <= sunday) {
//       weekDates.push(new Date(currentDate).getTime());
//       currentDate.setDate(currentDate.getDate() + 1);
//     }
//     let weeklyAttendance = await Promise.all(
//       weekDates.map(async (date) => {
//         const currDate = new Date(date);
//         const startOfDay = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), 0, 0, 0, 0).getTime();
//         const endOfDay = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), 23, 59, 59, 999).getTime();    
//         const presentStudentCount = await getPresentStudentCount({sectionId,startOfDay,endOfDay});
//         const absentStudentCount = await getAbsentStudentCount({sectionId,startOfDay,endOfDay});
//         return [presentStudentCount,absentStudentCount];  
//       })
//     );

//     const totalStudentCount = await studentCountOfSectionService({ sectionId});
//     return res.send(success(200, { weeklyAttendance, totalStudentCount }));
//   } catch (err) {
//     return res.send(error(500, err.message));
//   }
// }

// export async function attendanceMonthlyStatusController(req, res) {
//   try {
//     const sectionId = req.params.sectionId;
//     const date = new Date();

//     const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
//     const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getTime();


//     const monthDates = [];
//     let currentDate = new Date(firstDayOfMonth); 

//     while (currentDate <= lastDayOfMonth) {
//       monthDates.push(new Date(currentDate).getTime()); 
//       currentDate.setDate(currentDate.getDate() + 1); 
//      }

//      let monthlyAttendance = await Promise.all(
//       monthDates.map(async (d) => {
//         const date = new Date(d);
//         console.log({date})
//         const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
//         const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();    
//         const presentStudentCount = await getPresentStudentCount({sectionId,startOfDay,endOfDay});
//         return presentStudentCount;
//       })
//     );
//     const totalStudentCount = await studentCountOfSectionService({ sectionId });
//     return res.send(success(200, { monthlyAttendance, totalStudentCount }));
//   } catch (err) {
//     return res.send(error(500, err.message));
//   }
// }

// export async function parentMonthlyAttendanceStatusController(req, res) {
//   try {
//     const studentId = req.params.studentId;
//     const month = req.params.month;
//     const parentId = req.parentId;
//     const year = 2024;
//     if (!studentId || !month) {
//       return res.send(error(400, "studentId and month is required"));
//     }

//     const date = new Date();
//     const firstDayOfMonth = new Date(year, month, 1).getTime();
//     const lastDayOfMonth = new Date(year, month + 1, 0).getTime();

//     const monthlyAttendance = await getMonthlyAttendance({ studentId, firstDayOfMonth , lastDayOfMonth});
//     console.log(monthlyAttendance);
//     if (monthlyAttendance instanceof Error) {
//       return res.send(error(400, "can't get monthly attendance"));
//     }
//     const formattedAttendance = monthlyAttendance.map(doc => {
//       const formattedDoc = doc.toObject(); 
//       formattedDoc.date = new Date(doc.date).toISOString(); 
//       return formattedDoc;
//     });
//     return res.send(success(200, { formattedAttendance }));
//   } catch (err) {
//     return res.send(error(500, err.message));
//   } 
// }

// export async function parentMonthlyAttendanceCountController(req,res){
//   try {
//     const {studentId,month,year} = req.body;
//     const parentId = req.parentId;
//     if(!studentId || !month || !year){
//       return res.send(error(400,"studentId and month is required"));
//     }    

//     if(month<0 || month>11){
//       return res.send(error(400,"invalid month"));
//     }

//     const date = new Date();
//     const firstDayOfMonth = new Date(Date.UTC(year, month, 1)).getTime();
//     const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0)).getTime();

//     const student = await findStudentById(studentId);
//     if(!student){
//       return res.send(error(400,"Student not found"));
//     }


//     const attendances = await getAttendancesService({student:studentId, date:{$gte:startTime, $lte:endTime}});
//     const sectionAttendances = await getSectionAttendanceStatusService({sectionId:student["section"],firstDayOfMonth,lastDayOfMonth});
    
//     console.log({monthlyAttendanceCount,totalMonthlyAttendanceCount})
//     return res.send(success(200,{monthlyAttendanceCount,totalMonthlyAttendanceCount}));
//   } catch (err) {
//     return res.send(error(500,err.message));  
//   }
// }

// export async function teacherMonthlyAttendanceCountController(req,res){
//   try {
//      const {studentId,month,year} = req.body;
//      if(!studentId || !month || !year){
//        return res.send(error(400,"studentId and month is required"));
//      }    

//     if(month<0 || month>11){
//       return res.send(error(400,"invalid month"));
//     }

//     const date = new Date();
//     const firstDayStr = new Date(year, month, 1).toLocaleDateString('en-CA');
//     const lastDayStr = new Date(year, month + 1, 0).toLocaleDateString('en-CA');

//     const firstDay = new Date(firstDayStr);
//     const lastDay = new Date(lastDayStr);


//     const monthlyAttendanceCount = await getMonthlyPresentCount({studentId,firstDay,lastDay});
//     const totalMonthlyAttendanceCount = await getTotalMonthlyAttendanceCount({firstDay,lastDay});

//     console.log({monthlyAttendanceCount,totalMonthlyAttendanceCount})
//     return res.send(success(200,{monthlyAttendanceCount,totalMonthlyAttendanceCount}));
//   } catch (err) {
//     return res.send(error(500,err.message));  
//   }
// }

// export async function parentYearlyAttendanceCountController(req,res){
//   try {
//      const {studentId} = req.body;
//      let {year} = req.body;
//      year = Number(year);
//      const parentId = req.parentId;

//     if(!studentId ||  !year){
//       return res.send(error(400,"studentId and year is required"));
//     }   
    
//     const date = new Date();
//     const firstDayOfYear = new Date(Date.UTC(year, 0, 1)).getTime();
//     const lastDayOfYear = new Date(Date.UTC(year, 12, 0)).getTime();

//     const student = await findStudentById(studentId);
//     if(!student){
//       return res.send(error(400,"Student not found."));
//     }

//     const presentCount = await getYearlyPresentCount({studentId,firstDayOfYear,lastDayOfYear});
//     const totalCount = await getTotalYearlyAttendanceCount({sectionId:student["section"],firstDayOfYear,lastDayOfYear});
    
//     return res.send(success(200,{presentCount,totalCount}));
//   } catch (err) {
//     return res.send(error(500,err.message));  
//   }
// }

// export async function teacherYearlyAttendanceCountController(req,res){
//   try {
//      const {studentId} = req.body;
//      let {year} = req.body;
//      year = Number(year);

//     if(!studentId ||  !year){
//       return res.send(error(400,"studentId and year is required"));
//     }   
    
//     const date = new Date();
//     const firstDayStr = new Date(year, 3, 1).toLocaleDateString('en-CA');
//     const lastDayStr = new Date(year+1, 2, 31).toLocaleDateString('en-CA');

//     const firstDay = new Date(firstDayStr);
//     const lastDay = new Date(lastDayStr);

//     const presentCount = await getYearlyPresentCount({studentId,firstDay,lastDay});
//     const totalCount = await getTotalYearlyAttendanceCount({studentId,firstDay,lastDay});
    
//     return res.send(success(200,{presentCount,totalCount}));
//   } catch (err) {
//     return res.send(error(500,err.message));  
//   }
// }

// Date.prototype.getWeekDates = function () {
//   var date = new Date(this.getTime());
//   date.setHours(0, 0, 0, 0);

//   var day = date.getDay();
//   var diffToMonday = day === 0 ? -6 : 1 - day;
//   var diffToSunday = day === 0 ? 0 : 7 - day;

//   var monday = new Date(date);
//   monday.setDate(date.getDate() + diffToMonday);

//   var sunday = new Date(date);
//   sunday.setDate(date.getDate() + diffToSunday);

//   return { monday, sunday };
// };