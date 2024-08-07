import { getHolidayEventsOfSchool, getParentCountOfSchool, getPresentCountOfSchool, getTeacherCountOfSchool, getTotalStudentCountOfSchool } from "../services/dashboardAdmin.services.js";
import { getAbsentStudentCount, getPresentStudentCount, studentCountOfSectionService } from "../services/student.service.js";
import { error, success } from "../utills/responseWrapper.js";

export async function getPresentStudentsController(req,res){
  try {
    const adminId = req.adminId;
    const date = new Date();
    const currDate = date.getTime();
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();
 
    const presentCount = await getPresentCountOfSchool({adminId,startOfDay,endOfDay});
    console.log({presentCount})
    const totalCount = await getTotalStudentCountOfSchool({adminId});

    return res.send(success(200,{presentCount,totalCount}));    
  } catch (err) {
    return res.send(error(500,err.message));  
  }
}

export async function getParentCountController(req,res){
  try {
    const adminId = req.adminId;
    const count = await getParentCountOfSchool({adminId});
    return res.send(success(200,{parentCount:count}));    
  } catch(err) {
    return res.send(error(500,err.message));  
  }
}

export async function getTeacherCountController(req,res){
  try {
    const adminId = req.adminId;
    const count = await getTeacherCountOfSchool({adminId});
    return res.send(success(200,{teacherCount:count}));    
  } catch (err) {
    return res.send(error(500,err.message));  
  }
}

export async function getHolidayEventsOfMonthController(req,res){
  try {
    const adminId = req.adminId;
    const{month,year} = req.body;

    if(!month || !year){
      return res.send(error(400,"year and month is required"));
    }
    if(month>=12 || month<0){
      return res.send(error(400,"Invalid month"));
    }

    const date = new Date();
    const firstDayOfMonth = new Date(year, month, 1).getTime();
    const lastDayOfMonth = new Date(year, month + 1, 0).getTime();

    const holidayEvents = await getHolidayEventsOfSchool({adminId,firstDayOfMonth,lastDayOfMonth});
    return res.send(success(200,holidayEvents));   
  } catch (err) {
    return res.send(error(500,err.message));  
  }
}

export async function weeklyAttendanceOfSchoolController(req,res){
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
    console.log({weekDates});
    let weeklyAttendance = await Promise.all(
      weekDates.map(async (date) => {
        const currDate = new Date(date);
        const startOfDay = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), 0, 0, 0, 0).getTime();
        const endOfDay = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), 23, 59, 59, 999).getTime();    
        const presentStudentCount = await getPresentStudentCount({sectionId,startOfDay,endOfDay});
        // const absentStudentCount = await getAbsentStudentCount({sectionId,startOfDay,endOfDay});
        return presentStudentCount;  
      })
    );

    const totalStudentCount = await studentCountOfSectionService({ sectionId});
    return res.send(success(200, { weeklyAttendance, totalStudentCount }));  
  } catch (err) {
    return res.send(error(500,err.message));    
  }
}

export async function monthlyAttendanceOfSchoolController(req,res){
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
    const totalStudentCount = await studentCountOfSectionService({ sectionId });
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