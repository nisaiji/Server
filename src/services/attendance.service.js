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
      studentId,
      sectionId,
      classTeacherId,
      adminId
    } = data;
    const createdAttendance = await attendanceModel.create({
      date: currDate,
      day,
      teacherAttendance,
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
export async function checkAttendanceAlreadyMarkedByParent({
  studentId,
  currDate
}) {
  try {
    const attendanceMarked = await attendanceModel.findOne({
      $and: [
        { student: studentId },
        { date: currDate },
        { parentAttendance: "present" }
      ]
    });
    console.log({ attendanceMarked });
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
        { teacherAttendance: { $ne: "" } }
      ]
    });
    return attendance;
  } catch (error) {
    throw error;
  }
}
// export async function checkAttendanceMarkedByParent({ studentId, currDate }) {
//   try {
//     const attendance = await attendanceModel.findOne({
//       $and: [
//         { student: studentId },
//         { date: currDate },
//         { parentAttendance: { $ne: "" } }
//       ]
//     });
//     return attendance;
//   } catch (error) {
//     throw error;
//   }
// }

export async function getAttendaceByStudentId({ studentId, currDate }) {
  try {
    const attendance = await attendanceModel.findOne({
      $and: [{ student: studentId }, { date: currDate }]
    });
    // console.log({attendance})
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
        { parentAttendance: { $ne: "" } }
      ]
    });
    return attendance;
  } catch (error) {
    throw error;
  }
}
// export async function checkAttendanceMarkedByTeacher({ studentId, currDate }) {
//   try {
//     const attendance = await attendanceModel.findOne({
//       $and: [
//         { student: studentId },
//         { date: currDate },
//         { teacherAttendance: { $ne: "" } }
//       ]
//     });
//     return attendance;
//   } catch (error) {
//     throw error;
//   }
// }
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
      parentAttendance: attendance
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
  adminId
}) {
  try {
    const attendance = await attendanceModel.findByIdAndUpdate(attendanceId, {
      teacherAttendance,
      section: sectionId,
      classTeacher: classTeacherId,
      admin: adminId
    });
    return attendance;
  } catch (error) {
    throw error;
  }
}
export async function getMisMatchAttendance({ sectionId, date }) {
  try {
    const attendance = await attendanceModel
      .find({
        section: sectionId,
        date: date,
        parentAttendance: { $ne: "" },
        $or: [
          { teacherAttendance: "present", parentAttendance: "absent" },
          { teacherAttendance: "absent", parentAttendance: "present" }
        ]
      })
      .populate("student");
    return attendance;
  } catch (error) {
    throw error;
  }
}
export async function findAttendanceById(attendanceId) {
  try {
    const attendance = await attendanceModel.findById(attendanceId);
    return attendance;
  } catch (error) {
    throw error;
  }
}
export async function updateAttendance({ attendanceId, attendance }) {
  try {
    const result = await attendanceModel.findByIdAndUpdate(attendanceId, {
      teacherAttendance: attendance
    });
    console.log({ result });
    return result;
  } catch (error) {
    throw error;
  }
}
export async function getMonthlyPresentCount({ studentId, firstDay, lastDay }) {
  try {
    const count = await attendanceModel.countDocuments({
      student: studentId,
      teacherAttendance: "present",
      date: {
        $gte: firstDay,
        $lte: lastDay
      }
    });
    return count;
  } catch (error) {
    throw error;
  }
}

export async function getTotalMonthlyAttendanceCount({ firstDay, lastDay }) {
  try {
    const totalCount = await attendanceModel.aggregate([
      {
        $match: {
          date: {
            $gte: firstDay,
            $lte: lastDay
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }
        }
      },
      {
        $count: "countValue"
      }
    ]);

    return totalCount[0]["countValue"];
  } catch (error) {
    throw error;
  }
}

export async function getYearlyPresentCount({ studentId, firstDay, lastDay }) {
  try {
    const count = await attendanceModel.countDocuments({
      student: studentId,
      teacherAttendance: "present",
      date: {
        $gte: firstDay,
        $lte: lastDay
      }
    });
    return count;
  } catch (error) {
    throw error;
  }
}

export async function getTotalYearlyAttendanceCount({ firstDay, lastDay }) {
  try {
    const totalCount = await attendanceModel.aggregate([
      {
        $match: {
          date: {
            $gte: firstDay,
            $lte: lastDay
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }
        }
      },
      {
        $count: "countValue"
      }
    ]);

    return totalCount[0]["countValue"];
  } catch (error) {
    throw error;
  }
}

// export async function getYearlyPresentCount({studentId , regex}){
//   try {
//     console.log({regex})
//     const attendace = await attendanceModel.find({student:studentId,date:regex,teacherAttendance:"present"})
//     console.log({attendace})
//     return attendace.length;
//   } catch (error) {
//     throw error;
//   }
// }
// export async function getTotalYearlyAttendanceCount({regex}){
//   try {
//     console.log({regex})
//     const attendance = await attendanceModel.aggregate([{$match:{date:regex}},{$group:{_id:"$day"}},{$count:"total"}])
//     if(attendance.length>0)
//     return attendance[0]["total"];

//     return 0;
//   } catch (error) {
//     throw error;
//   }
// }

export async function getMonthlyAttendance({ studentId, firstDay, lastDay }) {
  try {
    const attendace = await attendanceModel.find({
      student: studentId,
      date: {
        $gte: firstDay,
        $lte: lastDay
      }
    });
    return attendace;
  } catch (error) {
    throw error;
  }
}
