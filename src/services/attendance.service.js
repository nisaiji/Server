import attendanceModel from "../models/attendance.model.js";
import holidayEventModel from "../models/holidayEvent.model.js";
import sectionModel from "../models/section.model.js";

export async function matchClassTeacherAndSection(classTeacherId, sectionId) {
  try {
    const matchedSection = await sectionModel.findOne({
      _id: sectionId,
      classTeacher: classTeacherId
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
      teacherAttendance,
      isTeacherMarked,
      studentId,
      sectionId,
      classTeacherId,
      adminId
    } = data;
    const createdAttendance = await attendanceModel.create({
      date: currDate,
      day,
      teacherAttendance,
      isTeacherMarked,
      student: studentId,
      section: sectionId,
      classTeacher: classTeacherId,
      admin: adminId
    });
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
    const checkHoliday = await holidayEventModel.findOne({
      date: currDate,
      admin: adminId,
      holiday: true
    });
    // console.log(holiday);
    return checkHoliday;
  } catch (error) {
    return error;
  }
}

export async function checkAttendanceAlreadyMarked({ sectionId, currDate }) {
  try {
    const attendanceMarked = await attendanceModel.findOne({
      $and: [{ section: sectionId }, { date: currDate }]
    });
    return attendanceMarked;
  } catch (error) {
    throw error;
  }
}

export async function checkAttendanceMarkedByTeacher({ studentId, currDate }) {
  try {
    const attendance = await attendanceModel.findOne({
      $and: [
        { student: studentId },
        { date: currDate },
        { isTeacherMarked: true }
      ]
    });
    return attendance;
  } catch (error) {
    throw error;
  }
}
export async function checkAttendanceMarkedByParent({ studentId, currDate }) {
  try {
    const attendance = await attendanceModel.findOne({
      $and: [
        { student: studentId },
        { date: currDate },
        { isParentMarked: true }
      ]
    });
    return attendance;
  } catch (error) {
    throw error;
  }
}

export async function markAttendanceByParent({
  studentId,
  currDate,
  day,
  attendance
}) {
  try {
    const markedAttendance = await attendanceModel.create({
      student: studentId,
      date: currDate,
      day,
      parentAttendance: attendance,
      isParentMarked: true
    });
    return markedAttendance;
  } catch (error) {
    throw error;
  }
}

export async function markAttendanceByTeacher({
  attendanceId,
  teacherAttendance,
  sectionId,
  classTeacherId,
  adminId,
  isTeacherMarked
}) {
  try {
    const attendance = await attendanceModel.findByIdAndUpdate(attendanceId, {
      teacherAttendance,
      section: sectionId,
      classTeacher: classTeacherId,
      admin: adminId,
      isTeacherMarked: true
    });
    return attendance;
  } catch (error) {
    throw error;
  }
}
