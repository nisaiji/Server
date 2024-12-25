import attendanceModel from "../models/attendance.model.js";

export async function getAttendanceService(filter) {
  try {
    const attendance = await attendanceModel.findOne(filter).lean();
    return attendance;
  } catch (error) {
    throw error;
  }
}

export async function getAttendancesService(filter) {
  try {
    const attendance = await attendanceModel.find(filter).lean();
    return attendance;
  } catch (error) {
    throw error;
  }
}

export async function getAttendanceCountService(filter) {
  try {
    const count = await attendanceModel.countDocuments(filter);
    return count;
  } catch (error) {
    throw error;
  }
}

export async function getAttendancePipelineService(pipeline){
  try {
    const attendances = await attendanceModel.aggregate(pipeline).exec();
    return attendances;
  } catch (error) {
    throw error;    
  }
}

export async function updateAttendanceService(filter, update) {
  try {
    const attendance = await attendanceModel.findByIdAndUpdate(filter, update);
    return attendance;
  } catch (error) {
    throw error;
  }
}

export async function createAttendanceService(data) {
  try {
    const attendance = await attendanceModel.create(data);
    return attendance;
  } catch (error) {
    throw error;
  }
}

export async function getMisMatchAttendanceService(data) {
  try {
    const { section, startTime, endTime } = data;
    const attendance = await attendanceModel
      .find({
        section,
        date: { $gte: startTime, $lte: endTime },
        $or: [
          { teacherAttendance: "absent", parentAttendance: "present" },
          { teacherAttendance: "present", parentAttendance: "absent" }
        ]
      })
      .populate("student");

    return attendance;
  } catch (error) {
    throw error;
  }
}
