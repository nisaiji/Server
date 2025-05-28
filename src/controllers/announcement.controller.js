import { StatusCodes } from "http-status-codes";
import { createAnnouncementService, getAnnouncementsPipelineService } from "../services/announcement.services.js";
import { error, success } from "../utills/responseWrapper.js";
import { convertToMongoId } from "../services/mongoose.services.js";

export async function createAnnouncementByAdminController(req, res) {
  try {
    const adminId = req.adminId;

    const { title, description, targetAudience, startsAt, expiresAt } = req.body;
    const announcement = await createAnnouncementService({
      title,
      description,
      targetAudience,
      startsAt,
      expiresAt,
      createdBy: adminId,
      createdByRole: "admin",
      school: adminId
    })
    return res.status(StatusCodes.CREATED).json(success(201, "Announcement created successfully!"));

  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error(500, err.message));
  }
}

export async function createAnnouncementByTeacherController(req, res) {
  try {
    const teacherId = req.teacherId;
    const sectionId = req.sectionId;
    const adminId = req.adminId;

    const { title, description, startsAt, expiresAt } = req.body;
    const announcement = await createAnnouncementService({
      title,
      description,
      targetAudience: ['parent'],
      startsAt,
      expiresAt,
      createdBy: teacherId,
      createdByRole: "teacher",
      section: sectionId,
      school: adminId
    })
    return res.status(StatusCodes.CREATED).json(success(201, "Announcement created successfully!"));

  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error(500, err.message));
  }
}

export async function getAnnouncementsByAdminPipelineController(req, res) {
  try {
    const adminId = req.adminId;

    const { page = 1, limit = 10, sortBy = "createdAt", order = "desc" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    const pipeline = [
      {
        $match: {
          createdBy: convertToMongoId(adminId),
          createdByRole: "admin",
          school: convertToMongoId(adminId),
          isActive: true
        }
      },
      {
        $sort: {
          [sortBy]: sortOrder
        }
      },
      {
        $skip: skip
      },
      {
        $limit: parseInt(limit)
      },
      {
        $lookup: {
          from: "classes",
          localField: "targetClasses.classId",
          foreignField: "_id",
          as: "classDetails"
        }
      },
      {
        $lookup: {
          from: "sections",
          localField: "targetClasses.sectionId",
          foreignField: "_id",
          as: "sectionDetails"
        }
      }
    ];

    const announcements = await getAnnouncementsPipelineService(pipeline);

    return res.status(200).json(success(200, {announcements, page, limit}));

  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(success(500, err.message));
  }
}


