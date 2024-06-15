import {
  checkAttendanceAlreadyMarked,
  checkHolidayEvent,
  createAttendance,
} from "../services/attendance.service.js";
import { error, success } from "../utills/responseWrapper.js";

export async function markAttendanceController(req, res) {
  try {
    // console.log(req.body,req.teacherId,req.params.sectionId);
    // const{studentId , sectionId,isPresent} = req.body;
    const { present, absent } = req.body;
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
    const currDate =
      date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
    const holidayEvent = await checkHolidayEvent({ currDate, adminId });
    if (holidayEvent) {
      return res.send(error(400, "today is scheduled as holiday!"));
    }
    console.log(present, absent);
    present.map(async (student) => {
        const attendance = await checkAttendanceAlreadyMarked({
          studentId: student._id,
          currDate,
        });
        console.log('attendance',attendance);
      //   attendance.isPresent = true;
      //   await attendance.save();
      const createdAttendance = await createAttendance({
        currDate,
        day,
        isPresent: student.isPresent,
        studentId: student._id,
        sectionId,
        classTeacherId,
        adminId,
      });
      //   console.log(createdAttendance);
      //   await createAttendance.save()
      //   console.log(attendance);
      // console.log(student);
    });
    absent.map(async (student) => {
        const attendance = await checkAttendanceAlreadyMarked({
          studentId: student._id,
          currDate,
        });
        console.log('attendance',attendance);
      //   attendance.isPresent = true;
      //   await attendance.save();
      const createdAttendance = await createAttendance({
        currDate,
        day,
        isPresent: student.isPresent,
        studentId: student._id,
        sectionId,
        classTeacherId,
        adminId,
      });
      // await createAttendance.save()
      //   console.log(attendance);
      // console.log(student);
    });
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
