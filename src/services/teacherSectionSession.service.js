import teacherSectionSessionModel from "../models/teacherSectionSession.model.js";

export async function getTeacherSectionSessionService(paramObj, projection = {}) {
  try {
    const teacherSectionSession = await teacherSectionSessionModel.findOne(paramObj);
    return teacherSectionSession;
  } catch (error) {
    throw error;
  }
}

export async function registerTeacherSectionSessionService(data) {
  try {
    const teacherSectionSession = await teacherSectionSessionModel.create(data);
    return teacherSectionSession;
  } catch (error) {
    throw error;
  }
}

export async function registerTeacherSectionSessionsService(data) {
  try {
    const teacherSectionSessions = await teacherSectionSessionModel.insertMany(data);
    return teacherSectionSessions;
  } catch (error) {
    throw error;
  }
}

export async function getTeacherSectionSessionsService(
  paramObj,
  projection = {},
  populateObj = ""
) {
  try {
    const teacherSectionSessions = await teacherSectionSessionModel
      .find(paramObj)
      .select(projection)
      .populate(populateObj);
    return teacherSectionSessions;
  } catch (error) {
    throw error;
  }
}

export async function deleteTeacherSectionSessionService(paramObj) {
  try {
    const teacherSectionSession = await teacherSectionSessionModel.deleteOne(paramObj);
    return teacherSectionSession;
  } catch (error) {
    throw error;
  }
}

export async function updateTeacherSectionSessionService(filter, update) {
  try {
    const teacherSectionSession = await teacherSectionSessionModel.findOneAndUpdate(filter, update);
    return teacherSectionSession;
  } catch (error) {
    throw error;
  }
}

export async function getTeacherSectionSessionsPipelineService(pipeline) {
  try {
    const teacherSectionSessions = await teacherSectionSessionModel.aggregate(pipeline).exec();
    return teacherSectionSessions;
  } catch (error) {
    throw error;
  }
}
