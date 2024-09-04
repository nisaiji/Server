import attendanceModel from "../models/attendance.model.js";
import holidayEventModel from "../models/holidayEvent.model.js";
 

export async function getAttendanceService(paramObj){
  try {
    const attendance = await attendanceModel.findOne(paramObj).lean();
    return attendance;
  } catch (error) {
    throw error;
  }
}

export async function getAttendancesService(paramObj){
  try {
    const attendance = await attendanceModel.find(paramObj).lean();
    return attendance;
  } catch (error) {
    throw error;
  }
}

export async function updateAttendanceService(data) {
  try {
   const{id, fieldsToBeUpdated} = data;
   console.log(data)
   const attendance = await attendanceModel.findByIdAndUpdate(id, fieldsToBeUpdated);
  console.log({attendance})
    return attendance;
  } catch (error) {
    throw error;
  }
}

export async function createAttendanceService(data) {
  try {
    const attendance = await attendanceModel.create(data);
    return attendance;
  } catch (error) {
    throw error;
  }
}

export async function getMisMatchAttendanceService(data) {
  try {
    const{ section, startOfDay,endOfDay } = data;
    const attendance = await attendanceModel.find({section, 
       date: { $gte: startOfDay, $lte: endOfDay },
       $or: [
        { teacherAttendance: "absent", parentAttendance: "present" },
        { teacherAttendance: "present", parentAttendance: "absent" }
      ]
    }).populate("student");
    
    return attendance;
  } catch (error) {
    throw error;
  }
}
