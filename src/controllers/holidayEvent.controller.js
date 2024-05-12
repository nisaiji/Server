import { checkHolidayEventExist, createHolidayEvent } from "../services/holidayEvent.service.js";
import { error, success } from "../utills/responseWrapper.js";

export async function createHolidayEventController(req,res){
    try {
        const{name,teacherHoliday,studentHoliday,description} = req.body;
        const date = new Date(req.body["date"]);
        const adminId = req.adminId;
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const day = daysOfWeek[date.getDay()];
        const formattedDate = date.getDate()+"-"+(date.getMonth()+1)+"-"+date.getFullYear();
        
        const holidayEvent = await checkHolidayEventExist({formattedDate,adminId});
        if(holidayEvent){
            return res.send(error(400,"holiday event already exists"));
        }
        const createdHolidayEvent = await createHolidayEvent({formattedDate,day,name,teacherHoliday,studentHoliday,description,adminId});
        if(createdHolidayEvent instanceof Error){
            return res.send(error(400,"holiday event cann't be created"));
        }
        return res.send(success(200,"holiday event has been created sucessfully"));

        
    } catch (err) {
        return res.send(error(500,err.message));       
    }
}