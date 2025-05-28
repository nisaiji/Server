import announcementModel from "../models/announcement.model.js";

export async function getAnnouncementService(filter) {
  try {
    const announcement = await announcementModel.findOne(filter).lean();
    return announcement;
  } catch (error) {
    throw error;
  }
}

export async function getAnnouncementsService(filter) {
  try {
    const announcements = await announcementModel.find(filter);
    return announcements;
  } catch (error) {
    throw error;
  }
}

export async function getAnnouncementCountService(filter) {
  try {
    const count = await announcementModel.countDocuments(filter);
    return count;
  } catch (error) {
    throw error;
  }
}

export async function createAnnouncementService(data) {
  try {
    const announcement = await announcementModel.create(data);
    return announcement;
  } catch (error) {
    throw error;
  }
}

export async function updateAnnouncementService(filter, update) {
  try {
    const updated = await announcementModel.updateOne(filter, update);
    return updated;
  } catch (error) {
    throw error;
  }
}

export async function deleteAnnouncementService(filter) {
  try {
    const deleted = await announcementModel.deleteOne(filter);
    return deleted;
  } catch (error) {
    throw error;
  }
}

export async function getAnnouncementsPipelineService(pipeline) {
  try {
    const announcements = await announcementModel.aggregate(pipeline).exec();
    return announcements;
  } catch (error) {
    throw error;
  }
}
