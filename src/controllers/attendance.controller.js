import {
  checkAttendanceAlreadyMarked,
  checkAttendanceMarkedByParent,
  checkAttendanceMarkedByTeacher,
  checkHolidayEvent,
  createAttendance,
  markAttendanceByParent,
  markAttendanceByTeacher,
} from "../services/attendance.service.js";
import {
  getAbsentStudentCount,
  getPresentStudentCount,
  getStudentCount,
} from "../services/student.service.js";
import { error, success } from "../utills/responseWrapper.js";

export async function markAttendanceController(req, res) {
  try {
    // console.log(req.body, req.teacherId, req.params.sectionId, req.adminId);
    // const{studentId , sectionId,isPresent} = req.body;
    const { present, absent} = req.body;
    const sectionId = req.params.sectionId;
    const classTeacherId = req.teacherId;
    const adminId = req.adminId;
    const date = new Date();
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const day = daysOfWeek[date.getDay()];
    if (day === "Sunday") {
      return res.send(error(400, "today is sunday"));
    }
    const currDate = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
    const holidayEvent = await checkHolidayEvent({ currDate, adminId });
    if (holidayEvent) {
      return res.send(error(400, "today is scheduled as holiday!"));
    }
    present.map(async (student) => {
      const parentMarkedAttendance = await checkAttendanceMarkedByParent({studentId:student["_id"],currDate});
      if(parentMarkedAttendance){
        const teacherMarkedAttendance = await markAttendanceByTeacher({attendanceId:parentMarkedAttendance["_id"],teacherAttendance: student.isPresent,sectionId,classTeacherId,adminId,isTeacherMarked})
      }
      else{
        const createdAttendance = await createAttendance({
          currDate,
          day,
          teacherAttendance: student.isPresent,
          isTeacherMarked:true,
          studentId: student._id, 
          sectionId,
          classTeacherId,
          adminId,
        });
      }
    });
    absent.map(async (student) => {
      const createdAttendance = await createAttendance({
        currDate,
        day,
        isPresent: student.isPresent,
        studentId: student._id,
        sectionId,
        classTeacherId,
        adminId,
      });
    });
    return res.send(success(200, "attendance marked sucessfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}
export async function parentMarkAttendanceController(req, res) {
  try {
    const { studentId,attendance} = req.body;
    const date = new Date();
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const day = daysOfWeek[date.getDay()];
    if (day === "Sunday") {
      return res.send(error(400, "today is sunday"));
    }
    const currDate = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
    const holidayEvent = await checkHolidayEvent({ currDate, adminId });
    if (holidayEvent) {
      return res.send(error(400, "today is scheduled as holiday!"));
    }
    const isTeacherMarkedAttendance = await checkAttendanceMarkedByTeacher({studentId,currDate});
    if(isTeacherMarkedAttendance){
      return res.send(error(400,"parent can't mark attendance,teacher already marked."));
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

// export async function markAttendanceController(req,res){
//     try {
//         const{studentId , sectionId,isPresent} = req.body;
//         const classTeacherId = req.classTeacherId;
//         const adminId = req.adminId;
//         const date = new Date();
//         const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//         const day = daysOfWeek[date.getDay()];
//         if(day==="Sunday"){
//             return res.send(error(400,"today is sunday"));
//         }
//         const currDate = date.getDate()+"-"+(date.getMonth()+1)+"-"+date.getFullYear();
//         const holidayEvent = await checkHolidayEvent({currDate,adminId});
//         if(holidayEvent){
//             return res.send(error(400,"today is scheduled as holiday!"));
//         }
//         const attendance = await checkAttendanceAlreadyMarked({studentId,currDate});
//         if(attendance){
//             attendance["isPresent"] = isPresent;
//             await attendance.save();
//             return res.send(success(400,"attendance updated successfully"));
//         }
//         const createdAttendance = await createAttendance({currDate,day,isPresent,studentId,sectionId,classTeacherId,adminId});
//         return res.send(success(200,"attendance marked sucessfully"));
//     } catch (err) {
//         return res.send(error(500,err.message));
//     }
// }

export async function checkAttendaceMarkedController(req, res) {
  try {
    const adminId = req.adminId;
    const sectionId = req.params.sectionId;
    const date = new Date();
    const currDate =
      date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
    const holidayEvent = await checkHolidayEvent({ currDate, adminId });
    if (holidayEvent) {
      return res.send(error(400, "today is scheduled as holiday!"));
    }
    const checkAttendanceMarked = await checkAttendanceAlreadyMarked({
      sectionId,
      currDate,
    });
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
    // console.log(sectionId);
    const date = new Date();
    const currDate =
      date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
    // const holidayEvent = await checkHolidayEvent({ currDate, adminId });
    // console.log({sectionId})
    const totalStudentCount = await getStudentCount({ sectionId });
    const presentStudentCount = await getPresentStudentCount({
      sectionId,
      currDate,
    });
    const absentStudentCount = await getAbsentStudentCount({
      sectionId,
      currDate,
    });
    return res.send(
      success(200, {
        totalStudentCount,
        presentStudentCount,
        absentStudentCount,
      })
    );
  } catch (err) {
    return res.send(error(500, err.message));
  }
}


export async function attendanceWeeklyStatusController(req, res) {
  try {
    const sectionId = req.params.sectionId;
    const date = new Date();
    const { monday, sunday } = date.getWeekDates();
    // console.log(sectionId,adminId,monday,sunday);
    const weekDates = [];
    let currentDate = new Date(monday);
    while (currentDate <= sunday) {
      weekDates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    let weeklyAttendance = await Promise.all(
      weekDates.map(async (date) => {
        const currDate =
          date.getDate() +
          "-" +
          (date.getMonth() + 1) +
          "-" +
          date.getFullYear();
        const presentStudentCount = await getPresentStudentCount({
          sectionId,
          currDate,
        });
        return presentStudentCount;
      })
    );

    const totalStudentCount = await getStudentCount({ sectionId });
    // console.log(weeklyAttendance);
    return res.send(success(200, { weeklyAttendance, totalStudentCount }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function attendanceMonthlyStatusController(req, res) {
  try {
    const sectionId = req.params.sectionId;
    const date = new Date();
    // const { firstDay, lastDay } = date.getMonthDates();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const monthDates = [];
    let currentDate = new Date(firstDay);
    while (currentDate <= lastDay) {
      monthDates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    let monthlyAttendance = await Promise.all(
      monthDates.map(async (date) => {
        const currDate =
          date.getDate() +
          "-" +
          (date.getMonth() + 1) +
          "-" +
          date.getFullYear();
        const presentStudentCount = await getPresentStudentCount({
          sectionId,
          currDate,
        });
        return presentStudentCount;
      })
    );
    const totalStudentCount = await getStudentCount({ sectionId });
    console.log(monthlyAttendance);
    return res.send(success(200, { monthlyAttendance, totalStudentCount }));
  } catch (err) {
    return res.send(error(500, err.message));
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
