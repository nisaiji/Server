import teachingEventModel from "../models/teachingEvent.model.js";


export async function getTeachingEventService(paramObj, projection={}) {
    try {
        const teachingEvent = await teachingEventModel.findOne(paramObj);//.select(projection);
        return teachingEvent;
    }catch (error) {
        throw error;
    }
}

export async function createTeachingEvent(data){
    try {
        const teachingEvent = await teachingEventModel.create(data);
        return teachingEvent;
    } catch (error) {
        throw error;
    }
}

export async function createTeachingEventsService(data)  {
    try{
        const teachingEvents = await teachingEventModel.insertMany(data);
        return teachingEvents;
    } catch (error){
        throw error;
    }
}

export async function getTeachingEventsService(paramObj, projection={}, populateObj="") {
    try {
        const teachingEvents = await teachingEventModel.find(paramObj).select(projection).populate(populateObj);
        return teachingEvents;
    } catch (error) {
        throw error;
    }
}

export async function deleteTeachingEventService(paramObj) {
    try {
        const teachingEvent = await teachingEventModel.deleteOne(paramObj);
        return teachingEvent;
    } catch (error) {
        throw error;
    }
}

export async function updateTeachingEventService(filter, update) {
    try {
        const teachingEvent = await teachingEventModel.findOneAndUpdate(filter, update);
        return teachingEvent;
    } catch (error) {
        throw error;
    }
}

export async function getTeachingEventsPipelineService(pipeline) {
    try {
        const teachingEvents = await teachingEventModel.aggregate(pipeline).exec();
        return teachingEvents;
    } catch (error) {
        throw error;
    }
}
