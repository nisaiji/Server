import holidayEventModel from "../models/holidayEvent.model.js";

export async function createHolidayEvent(data){
    try {
        const{formattedDate,day,name,teacherHoliday,studentHoliday,description,adminId} = data;
        const holidayEvent = await holidayEventModel.create({date:formattedDate,day,name,teacherHoliday,studentHoliday,description,admin:adminId});
        return holidayEvent;
    } catch (error) {
        return error;
    }
}

export async function checkHolidayEventExist(data){
    try {
        const{formattedDate, adminId}=data;
        const holidayEvent = await holidayEventModel.findOne({date:formattedDate,admin:adminId});
        return holidayEvent;        
    } catch (error){
        return error;      
    }
}