import { findAdminByID } from "../services/admin.services.js";
import { checkHolidayEventExist, createHolidayEvent,deleteHolidayEventById,getEventList, getHolidayEventById, updateHolidayEvent } from "../services/holidayEvent.service.js";
import { error, success } from "../utills/responseWrapper.js";

export async function createHolidayEventController(req,res){
    try {
        const{title,holiday,event,description} = req.body;
        const date = new Date(req.body["date"]);
        console.log({date})
        if(date instanceof Error){
            return res.send(error(400,"invalid date"))
        }
        const adminId = req.adminId;
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const day = daysOfWeek[date.getDay()];

        const currDate = date.setHours(0,0,0,0);
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
        const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();

        const holidayEvent = await checkHolidayEventExist({adminId,startOfDay,endOfDay});
        if(holidayEvent){
            return res.send(error(400,"holiday event already exists"));
        }
        const createdHolidayEvent = await createHolidayEvent({currDate,day,title,holiday,event,description,adminId});
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
        const {month,year} = req.body;
        const startOfMonth = new Date(year, month, 1).getTime();
        const endOfMonth = new Date(year, month + 1, 0).getTime();
        const adminId = req.adminId;
        const admin = await findAdminByID(adminId);
        if(!admin){
            return res.send(error(400,"admin doesn't exists"));
        }
        const eventList = await getEventList({adminId,startOfMonth,endOfMonth});
        // const updateEventList = eventList.map(doc => {
        //     const formattedDoc = doc.toObject();
        //     formattedDoc.date = new Date(doc.date)
        //     return formattedDoc;
        //   });
        return res.send(success(200,eventList));
    } catch (err) {
        return res.send(error(500,err.message));       
    }
}

export async function updateHolidayEventController(req,res){
    try {
        const eventId = req.params.eventId;
        const {title,description,holiday,event} = req.body;
        const holidayEvent = await getHolidayEventById({eventId});

        if(!holidayEvent){
            return res.send(error(400,"Event not found."));
        }
        const updatedHolidayEvent = await updateHolidayEvent({eventId,title,description,holiday,event});
        if(updateHolidayEvent instanceof Error){
            return res.send(error(400,"Holiday-event can't updated"));
        }

        return res.send(success(200,"Holiday event updated successfully"));
    } catch (err) {
        return res.send(error(500,err.message));        
    }
}

export async function deleteHolidayEventController(req,res){
    try {
        const eventId = req.params.eventId;
        const event = await getHolidayEventById({eventId});
        if(!event){
            return res.send(error(400,"event doesn't exists"));
        }
        const deletedEvent = await deleteHolidayEventById({eventId});
        if(deletedEvent instanceof Error){
            return res.send(error(400,"can't delete the event."));
        }
        return res.send(success(200,"event deleted successfully"));
    } catch (err) {
        return res.send(error(500,err.message));       
    }
}