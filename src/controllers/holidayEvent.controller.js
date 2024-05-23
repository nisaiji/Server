import { findAdminByID } from "../services/admin.services.js";
import { checkHolidayEventExist, createHolidayEvent,getEventList } from "../services/holidayEvent.service.js";
import { error, success } from "../utills/responseWrapper.js";

export async function createHolidayEventController(req,res){
    try {
        const{title,teacherHoliday,studentHoliday,description} = req.body;
        const date = new Date(req.body["date"]);
        const adminId = req.adminId;
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const day = daysOfWeek[date.getDay()];
        const formattedDate = date.getDate()+"-"+(date.getMonth()+1)+"-"+date.getFullYear();
        
        const holidayEvent = await checkHolidayEventExist({formattedDate,adminId});
        if(holidayEvent){
            return res.send(error(400,"holiday event already exists"));
        }
        const createdHolidayEvent = await createHolidayEvent({formattedDate,day,title,teacherHoliday,studentHoliday,description,adminId});
        if(createdHolidayEvent instanceof Error){
            return res.send(error(400,"holiday event cann't be created"));
        }
        return res.send(success(200,"holiday event has been created sucessfully"));

        
    } catch (err) {
        return res.send(error(500,err.message));       
    }
}

export async function getHolidayEventController(req,res){
    try {
        const adminId = req.adminId;
        const admin = await findAdminByID(adminId);
        if(!admin){
            return res.send(error(400,"admin doesn't exists"));
        }
        const eventList = await getEventList({adminId});
        return res.send(success(200,eventList));
    } catch (err) {
        return res.send(error(500,err.message));       
    }
}