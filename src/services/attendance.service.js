import attendanceModel from "../models/attendance.model.js";
import holidayEventModel from "../models/holidayEvent.model.js";
import sectionModel from "../models/section.model.js";

export async function matchClassTeacherAndSection(classTeacherId, sectionId) {
  try {
    const matchedSection = await sectionModel.findOne({
      _id: sectionId,
      classTeacher: classTeacherId,
    });
    return matchedSection;
  } catch (error) {
    return error;
  }
}

export function matchStudentAndSection(students, studentId) {
  const check = students.includes(studentId);
  return check;
}

export async function createAttendance(data) {
  try {
    const {
      currDate,
      day,
      isPresent,
      studentId,
      sectionId,
      classTeacherId,
      adminId,
    } = data;
    const createdAttendance = await attendanceModel.create({
      date: currDate,
      day,
      isPresent:isPresent,
      student: studentId,
      section: sectionId,
      classTeacher: classTeacherId,
      admin: adminId,
    });
    console.log("ca", createdAttendance);
    return createdAttendance;
  } catch (error) {
    return error;
  }
}

// export async function checkAttendanceAlreadyMarked(data) {
//   try {
//     const { studentId, currDate } = data;
//     const attendance = await attendanceModel.findOne({
//       date: currDate,
//       student: studentId,
//     });
//     return attendance;
//   } catch (error) {
//     return error;
//   }
// }

export async function checkHolidayEvent(data) {
  try {
    const { currDate, adminId } = data;
    // console.log({currDate,adminId});
    const holiday = await holidayEventModel.findOne({
      date: currDate,
      admin: adminId,
    });
    // console.log(holiday);
    return holiday;
  } catch (error) {
    return error;
  }
}

export async function checkAttendanceAlreadyMarked({sectionId, currDate}){
  try {
    const attendanceMarked = await attendanceModel.findOne({$and:[{section:sectionId},{date:currDate}]});
    return attendanceMarked;
  } catch (error) {
    throw error;    
  }
}