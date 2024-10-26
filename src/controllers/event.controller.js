import { getReceiver, getUser } from "../helper/event.helper.js";
import { StatusCodes } from "http-status-codes";
import {getEventsCountService, getEventsPipelineService, registerEventService } from "../services/event.services.js";
import { error, success } from "../utills/responseWrapper.js";
import { convertToMongoId } from "../services/mongoose.services.js";


export async function registerEventController(req, res){
  try {
    const {
      type,
      sender: { id: senderId, model: senderModel },
      receiver: { id: receiverId, model: receiverModel },
      title,
      description
    } = req.body;
    let date = new Date();
    date = date.getTime();
    console.log({senderId, receiverModel})

    const[sender, receiver] = await Promise.all([
      await getUser(senderModel, senderId),
      await getUser(receiverModel, receiverId)
    ]);

    
    if(!sender){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Sender not found"));
    }
    if(!receiver){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Receiver not found"));
    }

    const eventObj = {type, title, description, sender:{ id: senderId, model:senderModel }, receiver:{id: receiverId, model: receiverModel}, date, status:"pending"}
    await registerEventService(eventObj) 
    return res.status(StatusCodes.OK).send(success(200, "Event created successfully"));
    
  } catch (err) {
    return res.send(error(500,err.message));
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
    return res.send(error(500,err.message));
  }
}

