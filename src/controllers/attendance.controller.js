import {checkAttendanceAlreadyMarked,checkAttendanceAlreadyMarkedByParent,checkAttendanceMarkedByParent,checkAttendanceMarkedByTeacher,checkHolidayEvent,createAttendance,findAttendanceById,getMisMatchAttendance,getMonthlyAttendance,getMonthlyPresentCount,getTotalMonthlyAttendanceCount,getTotalYearlyAttendanceCount,getYearlyPresentCount,markAttendanceByParent,markAttendanceByTeacher, updateAttendance} from "../services/attendance.service.js";
import {findStudentById,getAbsentStudentCount,getPresentStudentCount,getStudentCount} from "../services/student.service.js";
import { error, success } from "../utills/responseWrapper.js";

export async function markAttendanceController(req, res) {
  try {
    const { present, absent} = req.body;
    const sectionId = req.params.sectionId;
    const classTeacherId = req.teacherId;
    const adminId = req.adminId;
    const date = new Date();
    const currDate = date.getTime();
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();

    if(present.length==0 && absent.length==0){
      return res.send(error(400,"no student provided"));
    }

    const daysOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday",];
    const day = daysOfWeek[date.getDay()];

    if (day === "Sunday") {
      return res.send(error(400, "today is sunday"));
    }

    const holidayEvent = await checkHolidayEvent({adminId,startOfDay,endOfDay});
    if (holidayEvent) {
      return res.send(error(400, "today is scheduled as holiday!"));
    }

    const studentID = present.length>0?present[0]["_id"]:absent[0]["_id"];
    const isTeacherMarkedAttendance = await checkAttendanceMarkedByTeacher({studentId:studentID,startOfDay,endOfDay});
    if(isTeacherMarkedAttendance){
      return res.send(error(400,"attendance already marked by teacher"));
    }

    present.map(async (student) => {
      const parentMarkedAttendance = await checkAttendanceMarkedByParent({studentId:student["_id"],startOfDay,endOfDay});
      if(parentMarkedAttendance){
        const teacherMarkedAttendance = await markAttendanceByTeacher({attendanceId:parentMarkedAttendance["_id"],teacherAttendance:"present",sectionId,classTeacherId,adminId})
      }
      else{
        const createdAttendance = await createAttendance({currDate,day,teacherAttendance:"present",studentId: student._id,sectionId,classTeacherId,adminId});
      }
    });
    absent.map(async (student) => {
      const parentMarkedAttendance = await checkAttendanceMarkedByParent({studentId:student["_id"],startOfDay,endOfDay});
      if(parentMarkedAttendance){
        const teacherMarkedAttendance = await markAttendanceByTeacher({attendanceId:parentMarkedAttendance["_id"],teacherAttendance:"absent",sectionId,classTeacherId,adminId})
      }
      else{
        const createdAttendance = await createAttendance({currDate,day,teacherAttendance:"absent",studentId: student._id,sectionId,classTeacherId,adminId});
      }
    });
    return res.send(success(200, "attendance marked successfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function parentMarkAttendanceController(req, res) {
  try {
    const { studentId,attendance} = req.body;
    const parentId = req.parentId;
    const adminId = req.adminId;
    const date = new Date();
    const currDate = date.getTime();
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();


    if(!(attendance==="present" || attendance==="absent")){
      return res.send(error(400,"invalid attendance value"));
    }
    if(!studentId){
      return res.send(error(400,"studentId is required"));
    }
    const student = await findStudentById(studentId);
    if(!student){
      return res.send(error(400,"student not found"));
    }
    if((student["parent"].toString())!==parentId){
      return res.send(error(400,"parent is not authorized to mark attendance."));
    }

    const daysOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday",];
    const day = daysOfWeek[date.getDay()];
    if (day === "Sunday"){
      return res.send(error(400, "today is sunday"));
    }

    const holidayEvent = await checkHolidayEvent({ startOfDay,endOfDay, adminId });
    if (holidayEvent) {
      return res.send(error(400, "today is scheduled as holiday!"));
    }
    const isTeacherMarkedAttendance = await checkAttendanceMarkedByTeacher({studentId,startOfDay , endOfDay});
    if(isTeacherMarkedAttendance){
      return res.send(error(400,"parent can't mark attendance,teacher already marked."));
    }
    const isParentMarkedAttendance = await checkAttendanceMarkedByParent({studentId,startOfDay , endOfDay});
    if(isParentMarkedAttendance){
      return res.send(error(400,"attendance already marked by parent"));
    }
    const markAttendance = await markAttendanceByParent({studentId,currDate,day,attendance});
    if(markAttendance instanceof Error){
      return res.send(error(400,"parent is unable to mark attendance"));
    }
    return res.send(success(200, "attendance marked sucessfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function checkAttendaceMarkedController(req, res) {
  try {
    const adminId = req.adminId;
    const sectionId = req.params.sectionId;
    const date = new Date();

    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();

    const holidayEvent = await checkHolidayEvent({adminId,startOfDay,endOfDay });
    if (holidayEvent) {
      return res.send(error(400, "today is scheduled as holiday!"));
    }
    const checkAttendanceMarked = await checkAttendanceAlreadyMarked({sectionId,startOfDay,endOfDay});
    if (checkAttendanceMarked) {
      return res.send(error(400, "attendance already marked"));
    }
    return res.send(success(200, "attendance haven't marked today"));
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
      return res.send(error(400, "today is scheduled as holiday!"));
    }
    const checkAttendanceMarked = await checkAttendanceAlreadyMarkedByParent({studentId,startOfDay,endOfDay});
    if (checkAttendanceMarked) {
      return res.send(error(400, "attendance already marked"));
    }
    return res.send(success(200, "attendance haven't marked today"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function attendanceDailyStatusController(req, res) {
  try {
    const sectionId = req.params.sectionId;
    const date = new Date();
    const currDate = date.getTime();
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();
 
    const totalStudentCount = await getStudentCount({ sectionId });
    const presentStudentCount = await getPresentStudentCount({sectionId,startOfDay,endOfDay});
    const absentStudentCount = await getAbsentStudentCount({sectionId,startOfDay,endOfDay});
    return res.send(success(200, {totalStudentCount,presentStudentCount,absentStudentCount,}));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function attendanceWeeklyStatusController(req, res) {
  try {
    const sectionId = req.params.sectionId;
    const date = new Date();
    const { monday, sunday } = date.getWeekDates();

    const weekDates = [];
    let currentDate = new Date(monday);
    while (currentDate <= sunday) {
      weekDates.push(new Date(currentDate).getTime());
      currentDate.setDate(currentDate.getDate() + 1);
    }
    let weeklyAttendance = await Promise.all(
      weekDates.map(async (date) => {
        const currDate = new Date(date);
        const startOfDay = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), 0, 0, 0, 0).getTime();
        const endOfDay = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), 23, 59, 59, 999).getTime();    
        const presentStudentCount = await getPresentStudentCount({sectionId,startOfDay,endOfDay});
        const absentStudentCount = await getAbsentStudentCount({sectionId,startOfDay,endOfDay});
        return [presentStudentCount,absentStudentCount];  
      })
    );

    const totalStudentCount = await getStudentCount({ sectionId});
    return res.send(success(200, { weeklyAttendance, totalStudentCount }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function attendanceMonthlyStatusController(req, res) {
  try {
    const sectionId = req.params.sectionId;
    const date = new Date();

    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getTime();


    const monthDates = [];
    let currentDate = new Date(firstDayOfMonth); 

    while (currentDate <= lastDayOfMonth) {
      monthDates.push(new Date(currentDate).getTime()); 
      currentDate.setDate(currentDate.getDate() + 1); 
     }

     let monthlyAttendance = await Promise.all(
      monthDates.map(async (d) => {
        const date = new Date(d);
        console.log({date})
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
        const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();    
        const presentStudentCount = await getPresentStudentCount({sectionId,startOfDay,endOfDay});
        return presentStudentCount;
      })
    );
    const totalStudentCount = await getStudentCount({ sectionId });
    return res.send(success(200, { monthlyAttendance, totalStudentCount }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function getMisMatchAttendanceController(req,res){
  try {
    const sectionId = req.params.sectionId;
    const date = new Date();
    const currDate = date.getTime();
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();
    const daysOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday",];
    const day = daysOfWeek[date.getDay()];
    if (day === "Sunday") {
      return res.send(error(400, "today is sunday"));
    }
 
    const misMatchAttendance = await getMisMatchAttendance({sectionId,startOfDay,endOfDay});
    return res.send(success(200,{misMatchAttendance}));    
  } catch (err) {
    return res.send(error(500,err.message));
  }
}

export async function updateAttendanceController(req,res){
  try {
    const{present,absent} = req.body;

    let length = present?.length;
    for(let i=0;i<length; i++){
      const attendanceInstance = await findAttendanceById(present[i]["attendanceId"]);
      const updatedAttendance = await updateAttendance({attendanceId:present[i]["attendanceId"],attendance:"present"});
    }
    
    length = absent?.length;
    for(let i=0;i<length; i++){
      const attendanceInstance = await findAttendanceById(absent[i]["attendanceId"]);
      const updatedAttendance = await updateAttendance({attendanceId:absent[i]["attendanceId"],attendance:"absent"});
    }
    return res.send(success(200,"attendance updated successfully"))
    
  } catch (err) {
    return res.send(error(500,err.message)) ;   
  }
}

// export async function updateAttendanceController(req,res){
//   try {
//     const{attendanceId,attendance} = req.body;
//     const attendanceInstance = await findAttendanceById(attendanceId);
//     if(!(attendance==="present" || attendance==="absent")){
//       return res.send(error(400,"invalid attendance value"));
//     }
//     if(!attendanceInstance){
//       return res.send(error(400,"attendance is not registered"));
//     }
//     const updatedAttendance = await updateAttendance({attendanceId,attendance});
//     if(updatedAttendance instanceof Error){
//       return res.send(error(400,"can't update attendance"));
//     }
//     return res.send(success(200,"attendance updated successfully"))
    
//   } catch (err) {
//     return res.send(error(500,err.message)) ;   
//   }
// }

export async function parentMonthlyAttendanceStatusController(req, res) {
  try {
    const studentId = req.params.studentId;
    const month = req.params.month;
    const parentId = req.parentId;
    const year = 2024;
    if (!studentId || !month) {
      return res.send(error(400, "studentId and month is required"));
    }

    const date = new Date();
    const firstDayOfMonth = new Date(year, month, 1).getTime();
    const lastDayOfMonth = new Date(year, month + 1, 0).getTime();

    const monthlyAttendance = await getMonthlyAttendance({ studentId, firstDayOfMonth , lastDayOfMonth});
    console.log(monthlyAttendance);
    if (monthlyAttendance instanceof Error) {
      return res.send(error(400, "can't get monthly attendance"));
    }
    const formattedAttendance = monthlyAttendance.map(doc => {
      const formattedDoc = doc.toObject(); 
      formattedDoc.date = new Date(doc.date).toISOString(); 
      return formattedDoc;
    });
    return res.send(success(200, { formattedAttendance }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function parentMonthlyAttendanceCountController(req,res){
  try {
     const {studentId,month,year} = req.body;
    const parentId = req.parentId;
    if(!studentId || !month || !year){
      return res.send(error(400,"studentId and month is required"));
    }    

    if(month<0 || month>11){
      return res.send(error(400,"invalid month"));
    }

    const date = new Date();
    const firstDayOfMonth = new Date(Date.UTC(year, month, 1)).getTime();
    const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0)).getTime();


    const monthlyAttendanceCount = await getMonthlyPresentCount({studentId,firstDayOfMonth,lastDayOfMonth});
    const totalMonthlyAttendanceCount = await getTotalMonthlyAttendanceCount({firstDayOfMonth,lastDayOfMonth});

    console.log({monthlyAttendanceCount,totalMonthlyAttendanceCount})
    return res.send(success(200,{monthlyAttendanceCount,totalMonthlyAttendanceCount}));
  } catch (err) {
    return res.send(error(500,err.message));  
  }
}

export async function teacherMonthlyAttendanceCountController(req,res){
  try {
     const {studentId,month,year} = req.body;
     if(!studentId || !month || !year){
       return res.send(error(400,"studentId and month is required"));
     }    

    if(month<0 || month>11){
      return res.send(error(400,"invalid month"));
    }

    const date = new Date();
    const firstDayStr = new Date(year, month, 1).toLocaleDateString('en-CA');
    const lastDayStr = new Date(year, month + 1, 0).toLocaleDateString('en-CA');

    const firstDay = new Date(firstDayStr);
    const lastDay = new Date(lastDayStr);


    const monthlyAttendanceCount = await getMonthlyPresentCount({studentId,firstDay,lastDay});
    const totalMonthlyAttendanceCount = await getTotalMonthlyAttendanceCount({firstDay,lastDay});

    console.log({monthlyAttendanceCount,totalMonthlyAttendanceCount})
    return res.send(success(200,{monthlyAttendanceCount,totalMonthlyAttendanceCount}));
  } catch (err) {
    return res.send(error(500,err.message));  
  }
}

export async function parentYearlyAttendanceCountController(req,res){
  try {
     const {studentId} = req.body;
     let {year} = req.body;
     year = Number(year);
     const parentId = req.parentId;

    if(!studentId ||  !year){
      return res.send(error(400,"studentId and year is required"));
    }   
    
    const date = new Date();
    const firstDayOfMonth = new Date(Date.UTC(year, 0, 1)).getTime();
    const lastDayOfMonth = new Date(Date.UTC(year, 12, 0)).getTime();
    console.log({firstDayOfMonth,lastDayOfMonth})


    const presentCount = await getYearlyPresentCount({studentId,firstDayOfMonth,lastDayOfMonth});
    const totalCount = await getTotalYearlyAttendanceCount({studentId,firstDayOfMonth,lastDayOfMonth});
    
    return res.send(success(200,{presentCount,totalCount}));
  } catch (err) {
    return res.send(error(500,err.message));  
  }
}

export async function teacherYearlyAttendanceCountController(req,res){
  try {
     const {studentId} = req.body;
     let {year} = req.body;
     year = Number(year);

    if(!studentId ||  !year){
      return res.send(error(400,"studentId and year is required"));
    }   
    
    const date = new Date();
    const firstDayStr = new Date(year, 3, 1).toLocaleDateString('en-CA');
    const lastDayStr = new Date(year+1, 2, 31).toLocaleDateString('en-CA');

    const firstDay = new Date(firstDayStr);
    const lastDay = new Date(lastDayStr);

    const presentCount = await getYearlyPresentCount({studentId,firstDay,lastDay});
    const totalCount = await getTotalYearlyAttendanceCount({studentId,firstDay,lastDay});
    
    return res.send(success(200,{presentCount,totalCount}));
  } catch (err) {
    return res.send(error(500,err.message));  
  }
}

Date.prototype.getWeekDates = function () {
  var date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);

  var day = date.getDay();
  var diffToMonday = day === 0 ? -6 : 1 - day;
  var diffToSunday = day === 0 ? 0 : 7 - day;

  var monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);

  var sunday = new Date(date);
  sunday.setDate(date.getDate() + diffToSunday);

  return { monday, sunday };
};