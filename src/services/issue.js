import { getAbsentStudentCount } from "./student.service";

// MANY METHODS FOR SEARCH
findAdminByAdminName;
findAdminByEmail;
findAdminByphone;
getAdminById;

// WEEKLY ATTENDANCE STATUS
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
    const startOfDay = new Date(
      currDate.getFullYear(),
      currDate.getMonth(),
      currDate.getDate(),
      0,
      0,
      0,
      0
    ).getTime();
    const endOfDay = new Date(
      currDate.getFullYear(),
      currDate.getMonth(),
      currDate.getDate(),
      23,
      59,
      59,
      999
    ).getTime();
    const presentStudentCount = await getPresentStudentCount({
      sectionId,
      startOfDay,
      endOfDay
    });
    const absentStudentCount = await getAbsentStudentCount({
      sectionId,
      startOfDay,
      endOfDay
    });
    return [presentStudentCount, absentStudentCount];
  })
);

// GET WEEK DAYS
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

// MONTHLY ATTENDANCE STATUS
const monthDates = [];
let currentDate = new Date(firstDayOfMonth);
while (currentDate <= lastDayOfMonth) {
  monthDates.push(new Date(currentDate).getTime());
  currentDate.setDate(currentDate.getDate() + 1);
}
let monthlyAttendance = await Promise.all(
  monthDates.map(async (d) => {
    const date = new Date(d);
    console.log({ date });
    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0,
      0
    ).getTime();
    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999
    ).getTime();
    const presentStudentCount = await getPresentStudentCount({
      sectionId,
      startOfDay,
      endOfDay
    });
    return presentStudentCount;
  })
);
// getPresentStudentCount
export async function getPresentStudentCount({
  sectionId,
  startOfDay,
  endOfDay
}) {
  try {
    const presentCount = await attendanceModel.countDocuments({
      $and: [
        { section: sectionId },
        { date: { $gte: startOfDay, $lte: endOfDay } },
        { teacherAttendance: "present" }
      ]
    });
    console.log(presentCount);
    return presentCount;
  } catch (error) {
    throw error;
  }
}

// getAbsentStudentCount
export async function getAbsentStudentCount({
  sectionId,
  startOfDay,
  endOfDay
}) {
  try {
    const absentCount = await attendanceModel.countDocuments({
      $and: [
        { section: sectionId },
        { date: { $gte: startOfDay, $lte: endOfDay } },
        { teacherAttendance: "absent" }
      ]
    });
    console.log(absentCount);
    return absentCount;
  } catch (error) {
    throw error;
  }
}

// UPDATE ATTENDANCE
const { present, absent } = req.body;
let length = present?.length;
for (let i = 0; i < length; i++) {
  const attendanceInstance = await findAttendanceById(
    present[i]["attendanceId"]
  );
  const updatedAttendance = await updateAttendance({
    attendanceId: present[i]["attendanceId"],
    attendance: "present"
  });
}
length = absent?.length;
for (let i = 0; i < length; i++) {
  const attendanceInstance = await findAttendanceById(
    absent[i]["attendanceId"]
  );
  const updatedAttendance = await updateAttendance({
    attendanceId: absent[i]["attendanceId"],
    attendance: "absent"
  });
}

// GET TEACHERLIST WITH ITS SECTION
const teacherList = await getTeacherList({ adminId });
for (let i = 0; i < teacherList.length; i++) {
  section = await findSectionOfTeacher({ teacherid: teacherList[i]["_id"] });
  console.log({ section });
}

// MARK ATTENDANCE
export async function markAttendanceController(req, res) {
  try {
    const { present, absent } = req.body;
    const sectionId = req.params.sectionId;
    const classTeacherId = req.teacherId;
    const adminId = req.adminId;
    const date = new Date();
    const currDate = date.getTime();
    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0,
      0
    ).getTime();
    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999
    ).getTime();

    if (present.length == 0 && absent.length == 0) {
      return res.send(error(400, "no student provided"));
    }

    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];
    const day = daysOfWeek[date.getDay()];

    if (day === "Sunday") {
      return res.send(error(400, "today is sunday"));
    }

    const holidayEvent = await checkHolidayEvent({
      adminId,
      startOfDay,
      endOfDay
    });
    if (holidayEvent) {
      return res.send(error(400, "today is scheduled as holiday!"));
    }

    const studentID = present.length > 0 ? present[0]["_id"] : absent[0]["_id"];
    const isTeacherMarkedAttendance = await checkAttendanceMarkedByTeacher({
      studentId: studentID,
      startOfDay,
      endOfDay
    });
    if (isTeacherMarkedAttendance) {
      return res.send(error(400, "attendance already marked by teacher"));
    }

    present.map(async (student) => {
      const parentMarkedAttendance = await checkAttendanceMarkedByParent({
        studentId: student["_id"],
        startOfDay,
        endOfDay
      });
      if (parentMarkedAttendance) {
        const teacherMarkedAttendance = await markAttendanceByTeacher({
          attendanceId: parentMarkedAttendance["_id"],
          teacherAttendance: "present",
          sectionId,
          classTeacherId,
          adminId
        });
      } else {
        const createdAttendance = await createAttendance({
          currDate,
          day,
          teacherAttendance: "present",
          studentId: student._id,
          sectionId,
          classTeacherId,
          adminId
        });
      }
    });
    absent.map(async (student) => {
      const parentMarkedAttendance = await checkAttendanceMarkedByParent({
        studentId: student["_id"],
        startOfDay,
        endOfDay
      });
      if (parentMarkedAttendance) {
        const teacherMarkedAttendance = await markAttendanceByTeacher({
          attendanceId: parentMarkedAttendance["_id"],
          teacherAttendance: "absent",
          sectionId,
          classTeacherId,
          adminId
        });
      } else {
        const createdAttendance = await createAttendance({
          currDate,
          day,
          teacherAttendance: "absent",
          studentId: student._id,
          sectionId,
          classTeacherId,
          adminId
        });
      }
    });
    return res.send(success(200, "attendance marked successfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}
