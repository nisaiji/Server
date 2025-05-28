import { StatusCodes } from "http-status-codes";
import { createAnnouncementService, getAnnouncementCountService, getAnnouncementsPipelineService } from "../services/announcement.services.js";
import { error, success } from "../utills/responseWrapper.js";
import { convertToMongoId } from "../services/mongoose.services.js";
import { getStudentService } from "../services/student.service.js";

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

export async function getAnnouncementsByAdminController(req, res) {
  try {
    const adminId = req.adminId;

    const { page = 1, limit = 10, sortBy = "createdAt", order = "desc", createdBy="admin", section } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "asc" ? 1 : -1;
    const filter = {
      school: convertToMongoId(adminId),
      isActive: true,
    };

    if (createdBy === "admin") {
      filter.createdBy = convertToMongoId(adminId);
      filter.createdByRole = "admin";
    } 
    else if(createdBy === "teacher") {
      filter.createdByRole = "teacher";
    } 
    else if (createdBy === "all") {
      filter.$or = [
        { createdBy: convertToMongoId(adminId), createdByRole: "admin" },
        { createdByRole: "teacher" },
      ];
    }

    if(section) {
      filter.section = section;
    }

    const pipeline = [
      {
        $match: filter
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
          from: "sections",
          localField: "section",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1
              }
            }
          ],
          as: "sectionDetails"
        }
      }
    ];

    const announcements = await getAnnouncementsPipelineService(pipeline);
    const total = await getAnnouncementCountService(filter);

    return res.status(200).json(success(200, {announcements, page, limit, total}));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(success(500, err.message));
  }
}

export async function getAnnouncementsByTeacherController(req, res) {
  try {
    const adminId = req.adminId;
    const teacherId = req.teacherId;
    const sectionId = req.sectionId;

    const { page = 1, limit = 10, sortBy = "createdAt", order = "desc" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    const filter = {
      createdBy: convertToMongoId(teacherId),
      createdByRole: "teacher",
      school: convertToMongoId(adminId),
      isActive: true
    }

    const pipeline = [
      {
        $match: filter
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
          from: "sections",
          localField: "section",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1
              }
            }
          ],
          as: "sectionDetails"
        }
      }
    ];

    const announcements = await getAnnouncementsPipelineService(pipeline);
    const total = await getAnnouncementCountService(filter);

    return res.status(200).json(success(200, {announcements, page, limit, total}));

  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(success(500, err.message));
  }
}

export async function getAnnouncementsByParentController(req, res) {
 try {
   const parentId = req.parentId;
   const { studentId, page = 1, limit = 10 } = req.query;
   const student = await getStudentService({ _id: studentId, isActive: true });
   if (!student) {
     return res
       .status(StatusCodes.NOT_FOUND)
       .send(error(404, "Student not found"));
   }
   const adminId = student["admin"];
   const sectionId = student["section"];
   const skip = (parseInt(page) - 1) * parseInt(limit);
   const filter = {
     school: convertToMongoId(adminId),
     isActive: true,
     $or: [
       { createdBy: convertToMongoId(adminId), createdByRole: "admin" },
       { createdByRole: "teacher", section: convertToMongoId(sectionId) },
     ],
   };

   const pipeline = [
     {
       $match: filter,
     },
     {
       $sort: {
         createdAt: -1,
       },
     },
     {
       $skip: skip,
     },
     {
       $limit: parseInt(limit),
     },
     {
       $lookup: {
         from: "sections",
         localField: "section",
         foreignField: "_id",
         pipeline: [
           {
             $project: {
               _id: 1,
               name: 1,
             },
           },
         ],
         as: "sectionDetails",
       },
     },
   ];

   const announcements = await getAnnouncementsPipelineService(pipeline);
   const total = await getAnnouncementCountService(filter);

   return res
     .status(200)
     .json(success(200, { announcements, page, limit, total }));
 } catch (err) {
   return res
     .status(StatusCodes.INTERNAL_SERVER_ERROR)
     .send(error(500, err.message));
 }
}

