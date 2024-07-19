import { getHolidayEventsOfSchool, getParentCountOfSchool, getPresentCountOfSchool, getTeacherCountOfSchool, getTotalStudentCountOfSchool } from "../services/dashboardAdmin.services.js";
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
