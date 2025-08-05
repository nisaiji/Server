import announcementReadStatusModel from "../models/announcementReadStatus.model.js";

export async function getAnnouncementReadStatusService(filter) {
    try {
        const announcementReadStatus = await announcementReadStatusModel.findOne(filter).lean();
        return announcementReadStatus;
    } catch (error) {
        throw error;
    }
}

export async function getAnnouncementsReadStatusService(filter, projection={}) {
    try {
        const announcementReadStatus = await announcementReadStatusModel.find(filter).select(projection);
        return announcementReadStatus;
    } catch (error) {
        throw error;
    }
}

export async function getAnnouncementReadStatusCountService(filter) {
    try {
        const count = await announcementReadStatusModel.countDocuments(filter);
        return count;
    } catch (error) {
        throw error;
    }
}

export async function getAnnouncementReadStatusPipelineService(pipeline){
    try {
        const announcementReadStatus = await announcementReadStatusModel.aggregate(pipeline).exec();
        return announcementReadStatus;
    } catch (error) {
        throw error;
    }
}

export async function updateAnnouncementReadStatusService(filter, update) {
    try {
        const announcementReadStatus = await announcementReadStatusModel.findByIdAndUpdate(filter, update);
        return announcementReadStatus;
    } catch (error) {
        throw error;
    }
}

export async function createAnnouncementReadStatusService(data) {
    try {
        const announcementReadStatus = await announcementReadStatusModel.create(data);
        return announcementReadStatus;
    } catch (error) {
        throw error;
    }
}

export async function createAnnouncementsReadStatusService(data) {
    try {
        const announcementReadStatus = await announcementReadStatusModel.insertMany(data);
        return announcementReadStatus;
    } catch (error) {
        throw error;
    }
}

export async function deleteAnnouncementReadStatusService(paramObj) {
    try {
        const result = await announcementReadStatusModel.deleteMany(paramObj);
        return result;
    } catch (error) {
        throw error;
    }
}
