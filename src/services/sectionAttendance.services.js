import sectionAttendanceModel from "../models/sectionAttendance.model.js";

export async function getSectionAttendanceService(paramObj) {
  try {
    const attendance = await sectionAttendanceModel.findOne(paramObj);
    return attendance;
  } catch (error) {
    throw error;
  }
}

export async function getSectionAttendancesService(paramObj){
  try {
    const attendances = await sectionAttendanceModel.find(paramObj);
    return attendances;
  } catch (error) {
    throw error;
  }
}

export async function getSectionAttendanceStatusService(paramObj) {
  try {
    const attendance = await sectionAttendanceModel.find(paramObj).select({status:0,_id:0,section:0,teacher:0}).sort({ date: 1 });;
    return attendance;
  } catch (error) {
    throw error;
  }
}

export async function createSectionAttendanceService(data){
  try {
    const {date, section, teacher, presentCount, absentCount, status} = data;
    const sectionAttendance = await new sectionAttendanceModel();
    if(date){
      sectionAttendance["date"] = date;
    }
    if(section){
      sectionAttendance["section"] = section; 
    }
    if(teacher){
      sectionAttendance["teacher"] = teacher;
    }
    if(status){
      sectionAttendance["status"] = status;
    }
    if(presentCount){
      sectionAttendance["presentCount"] = presentCount;
    }
    if(absentCount){
      sectionAttendance["absentCount"] = absentCount;
    }
    await sectionAttendance.save();
    return sectionAttendance;
  } catch (error){
    throw error;    
  }
}

export async function updateSectionAttendanceService(data){
  try {
    const {date, section, teacher, presentCount, absentCount, status} = data;
    const sectionAttendance = await sectionAttendanceModel.findById(id);
    if(date){
      sectionAttendance["date"] = date;
    }
    if(section){
      sectionAttendance["section"] = section;
    }
    if(teacher){
      sectionAttendance["teacher"] = teacher;
    }
    if(status){
      sectionAttendance["status"] = status;
    }
    if(presentCount){
      sectionAttendance["presentCount"] = presentCount;
    }
    if(absentCount){
      sectionAttendance["absentCount"] = absentCount;
    }
    await sectionAttendance.save();
    return sectionAttendance;
  } catch (error){
    throw error;    
  }
}