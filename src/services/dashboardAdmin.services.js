import attendanceModel from "../models/attendance.model.js";
import holidayEventModel from "../models/holidayEvent.model.js";
import parentModel from "../models/parent.model.js";
import studentModel from "../models/student.model.js";
import teacherModel from "../models/teacher.model.js";

export async function getPresentCountOfSchool({adminId,startOfDay,endOfDay}){
  try {
    const count = await attendanceModel.countDocuments({
      admin: adminId,
      teacherAttendance: "present",
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });
    return count;
  } catch (error) {
    throw error;    
  }
}

export async function getTotalStudentCountOfSchool({adminId}){
  try {
    const count = studentModel.countDocuments({admin:adminId});
    return count;  
  } catch (error) {
    throw error;   
  }
}

export async function getParentCountOfSchool({adminId}){
  try {
    const count = parentModel.countDocuments({admin:adminId});
    return count;  
  } catch (error) {
    throw error;   
  }
}

export async function getTeacherCountOfSchool({adminId}){
  try {
    const count = teacherModel.countDocuments({admin:adminId});
    return count;  
  } catch (error) {
    throw error;   
  }
}

export async function getHolidayEventsOfSchool({adminId,firstDayOfMonth,lastDayOfMonth}){
  try {
    const list = await holidayEventModel.find({
      date: {$gte:firstDayOfMonth,$lte:lastDayOfMonth},
      admin: adminId
    });
    return list;
  } catch (error) {
    throw error;    
  }
}