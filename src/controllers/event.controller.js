import { getReceiver, getUser } from "../helpers/event.helper.js";
import { StatusCodes } from "http-status-codes";
import {getEventsCountService, getEventService, getEventsPipelineService, registerEventService, updateEventService } from "../services/event.services.js";
import { error, success } from "../utills/responseWrapper.js";
import { convertToMongoId } from "../services/mongoose.services.js";
import  otpGenerator  from "otp-generator"


export async function registerEventController(req, res){
  try {
    const {
      type,
      sender: { phone: senderPhone, model: senderModel },
      title,
      description
    } = req.body;
    let date = new Date();
    date = date.getTime();

    const sender = await getUser(senderModel, {phone: senderPhone, isActive: true});
    
    if(!sender){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Sender not found"));
    }
    const receiver = await getUser("admin", {_id:sender["admin"], isActive: true});
    if(!receiver){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Receiver not found"));
    }

    const eventObj = {type, title, description, sender:{ id: sender["_id"], model:senderModel }, receiver:{id: receiver["_id"], model: "admin"}, date, status:"pending"}
    await registerEventService(eventObj) 
    return res.status(StatusCodes.OK).send(success(200, "Event created successfully"));
    
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500,err.message));
  }
}

export async function getEventsController(req,res){
  try {
    const {model, type, status, include, startTime, endTime, page=1, limit=10} = req.query
    const[ receiverModel, receiverId ] = getReceiver(req);

    if(!receiverModel || !receiverId){
      return res.status(StatusCodes.UNAUTHORIZED).send(error(401, "Receiver details required!"));
    }
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum-1)*limitNum;
    console.log(typeof startTime)

    const filter ={ receiver: {id: convertToMongoId(receiverId), model: receiverModel }}
    filter["date"]={ $gte: Number(startTime), $lte: Number(endTime) }

    if(model){
      const modelsArray = model.split(",").map(modelVal=>modelVal.trim());
      filter["sender.model"] = { $in: modelsArray };
    }

    if(status){
      const statusArray = status.split(",").map(statusVal=>statusVal.trim());
      filter["status"] = { $in: statusArray };
    }

    const pipeline = [
      {
        $match: filter
      },
      {
        $sort: {date: 1}
      },
      {
        $skip: skipNum
      },
      {
        $limit: limitNum
      },
      {
        $project: {
          isRead: 0,
          __v: 0,
          createdAt: 0,
          updatedAt: 0,
        }
      }
    ];

    const events = await getEventsPipelineService(pipeline);
    const totalEvents = await getEventsCountService(filter);
    const totalPages = Math.ceil(totalEvents / limitNum);

    return res.status(StatusCodes.OK).send(success(200, {
      events,
      currentPage: pageNum,
      totalPages,
      totalEvents,
      pageSize: limitNum
    }));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500,err.message));
  }
}

export async function updateEventByAdminController(req, res){
  try {
    const{ eventId, status } = req.body;
    const[ receiverModel, receiverId ] = getReceiver(req);
    const event = await getEventService({_id: eventId});

    if(!event){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Event not found."));
    }

    console.log(event)
    if(event.receiver.id.toString()!==receiverId.toString()){
      return res.status(StatusCodes.UNAUTHORIZED).send(401, "Unauthorized to update event.");
    }

    const fieldsToBeUpdated = {};
    if(status==="accept"){
      fieldsToBeUpdated.otp = otpGenerator.generate(5, {lowerCaseAlphabets:false, upperCaseAlphabets:false, specialChars: false}); 
      fieldsToBeUpdated.status = status;
    }
    else{
      fieldsToBeUpdated.status = status;
    }
    await updateEventService({ _id: eventId }, fieldsToBeUpdated)
    return res.status(StatusCodes.OK).send(success(200, "Event updated successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500,err.message));
  }
}