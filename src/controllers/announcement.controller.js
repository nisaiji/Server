import { StatusCodes } from "http-status-codes";
import { createAnnouncementService, deleteAnnouncementService, getAnnouncementCountService, getAnnouncementService, getAnnouncementsPipelineService, updateAnnouncementService } from "../services/announcement.services.js";
import { error, success } from "../utills/responseWrapper.js";
import { convertToMongoId } from "../services/mongoose.services.js";
import { getStudentService } from "../services/student.service.js";
import { getTeachersByAdminIdService } from "../services/teacher.services.js";
import { getAdminService } from "../services/admin.services.js";
import { sendPushNotification } from "../config/firebase.config.js";
import { getParentsByAdminIdService } from "../services/v2/schoolParent.services.js";
import { getAnnouncementReadStatusService, getAnnouncementsReadStatusService } from "../services/announcementReadStatus.service.js";
import { getSessionStudentService } from "../services/v2/sessionStudent.service.js";

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
    const admin = await getAdminService({_id: adminId});
    const pushTitle = `Post by ${admin.schoolName}`;
    if(targetAudience.includes("teacher")) {
      const teachers = await getTeachersByAdminIdService(adminId);
      for(const teacher of teachers) {
        await sendPushNotification(teacher['fcmToken'], pushTitle, description);
      }
    }

    if(targetAudience.includes("parent")) {
      const parents = await getParentsByAdminIdService(adminId);
      for(const parent of parents) {
        await sendPushNotification(parent['fcmToken'], pushTitle, title);
      }
    }
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
      },
      {
        $lookup: {
          from: "teachers",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdByTeacher"
        }
      },
      {
        $lookup: {
          from: "admins",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdByAdmin"
        }
      },
      {
      $addFields: {
        createdByDetails: {
          $cond: [
            { $eq: ["$createdByRole", "teacher"] },
            { $arrayElemAt: ["$createdByTeacher", 0] },
            { $arrayElemAt: ["$createdByAdmin", 0] }
          ]
        }
      }
      },
      {
        $project: {
          createdByTeacher: 0,
          createdByAdmin: 0
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

    const { page = 1, limit = 10, sortBy = "createdAt", order = "desc", createdBy="teacher" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    if(!["admin", "teacher", "all"].includes(createdBy)) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Invalid Request"));
   }

    const filter = {
      school: convertToMongoId(adminId)
    }

    if (createdBy === "admin") {
      filter.createdBy = convertToMongoId(adminId);
      filter.createdByRole = "admin";
      filter.targetAudience = { $in: ["teacher"] };
    } 
    else if(createdBy === "teacher") {
      filter.createdBy = convertToMongoId(teacherId);
      filter.createdByRole = "teacher";
    } 
    else if (createdBy === "all") {
      filter.$or = [
        { createdBy: convertToMongoId(adminId), createdByRole: "admin", targetAudience: {$in: ['teacher']} },
        { createdBy: convertToMongoId(teacherId), createdByRole: "teacher" }
      ];
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
      },
      {
        $lookup: {
          from: "teachers",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdByTeacher"
        }
      },
      {
        $lookup: {
          from: "admins",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdByAdmin"
        }
      },
      {
      $addFields: {
        createdByDetails: {
          $cond: [
            { $eq: ["$createdByRole", "teacher"] },
            { $arrayElemAt: ["$createdByTeacher", 0] },
            { $arrayElemAt: ["$createdByAdmin", 0] }
          ]
        }
      }
      },
      {
        $project: {
          createdByTeacher: 0,
          createdByAdmin: 0
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

// export async function getAdminAnnouncementsByTeacherController(req, res) {
//   try {
//     const adminId = req.adminId;
//     const teacherId = req.teacherId;

//     const { page = 1, limit = 10, sortBy = "createdAt", order = "desc" } = req.query;
//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     const sortOrder = order === "asc" ? 1 : -1;

//     const filter = {
//       createdBy: convertToMongoId(adminId),
//       createdByRole: "admin",
//       school: convertToMongoId(adminId),
//       targetAudience: { $in: ["teacher"] }
//     }

//     const pipeline = [
//       {
//         $match: filter
//       },
//       {
//         $sort: {
//           [sortBy]: sortOrder
//         }
//       },
//       {
//         $skip: skip
//       },
//       {
//         $limit: parseInt(limit)
//       }
//     ];

//     const announcements = await getAnnouncementsPipelineService(pipeline);
//     const total = await getAnnouncementCountService(filter);

//     return res.status(200).json(success(200, {announcements, page, limit, total}));

//   } catch (err) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(success(500, err.message));
//   }
// }

// export async function getTeacherAnnouncementsByAdminController(req, res) {
//   try {
//     const adminId = req.adminId;
//     const { page = 1, limit = 10, sortBy = "createdAt", order = "desc", teacherId, sectionId } = req.query;
//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     const sortOrder = order === "asc" ? 1 : -1;

//     const filter = {
//       createdByRole: "teacher",
//       school: convertToMongoId(adminId),
//     }
//     if(teacherId) filter.createdBy = convertToMongoId(teacherId);
//     if(sectionId) filter.section = convertToMongoId(sectionId);

//     const pipeline = [
//       {
//         $match: filter
//       },
//       {
//         $sort: {
//           [sortBy]: sortOrder
//         }
//       },
//       {
//         $skip: skip
//       },
//       {
//         $limit: parseInt(limit)
//       }
//     ];

//     const announcements = await getAnnouncementsPipelineService(pipeline);
//     const total = await getAnnouncementCountService(filter);

//     return res.status(200).json(success(200, {announcements, page, limit, total}));
//   } catch (err) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(success(500, err.message));
//   }
// }

export async function getAnnouncementsByParentController(req, res) {
 try {
   const parentId = req.parentId;
   const { studentId, page = 1, limit = 10, createdBy = "admin" } = req.query;
   const student = await getStudentService({ _id: studentId, isActive: true });
   if (!student) {
     return res
       .status(StatusCodes.NOT_FOUND)
       .send(error(404, "Student not found"));
   }

   if(!["admin", "teacher", "all"].includes(createdBy)) {
    return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Invalid Request"));
   }
   const adminId = student["admin"];
   const sectionId = student["section"];
   const skip = (parseInt(page) - 1) * parseInt(limit);

   const filter = {
     school: convertToMongoId(adminId),
     isActive: true
    //  $or: [
    //    { createdBy: convertToMongoId(adminId), createdByRole: "admin" },
    //    { createdByRole: "teacher", section: convertToMongoId(sectionId) },
    //  ],
   };

   if (createdBy === "admin") {
     filter.createdBy = convertToMongoId(adminId);
     filter.createdByRole = "admin";
     filter.targetAudience = { $in: ["parent"] };
    } 
    else if(createdBy === "teacher") {
      filter.section = convertToMongoId(sectionId);
      filter.createdByRole = "teacher";
      filter.targetAudience = { $in: ["parent"] };
    } 
    else if (createdBy === "all") {
      filter.$or = [
        { createdBy: convertToMongoId(adminId), createdByRole: "admin", targetAudience: {$in: ['parent']} },
        { section: convertToMongoId(sectionId), createdByRole: "teacher", targetAudience: {$in: ['parent']} }
      ];
    }

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
      {
        $lookup: {
          from: "teachers",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdByTeacher"
        }
      },
      {
        $lookup: {
          from: "admins",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdByAdmin"
        }
      },
      {
      $addFields: {
        createdByDetails: {
          $cond: [
            { $eq: ["$createdByRole", "teacher"] },
            { $arrayElemAt: ["$createdByTeacher", 0] },
            { $arrayElemAt: ["$createdByAdmin", 0] }
          ]
        }
      }
      },
      {
        $project: {
          createdByTeacher: 0,
          createdByAdmin: 0
      }
      }
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

export async function updateAnnouncementByAdminController(req, res) {
  try {
    const adminId = req.adminId;
    const announcementId = req.params.announcementId;
    console.log({announcementId})
    const {
      title,
      description,
      targetAudience,
      startsAt,
      expiresAt,
      isActive,
    } = req.body;

    const filter = {
      _id: convertToMongoId(announcementId),
      createdBy: convertToMongoId(adminId),
      createdByRole: "admin"
    };
    const announcement = await getAnnouncementService(filter);
    if(!announcement) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Announcement not found!"));
    }
    const fieldToBeUpdated = {};
    if (title) fieldToBeUpdated.title = title;
    if (description) fieldToBeUpdated.description = description;
    if (targetAudience.length > 0)
      fieldToBeUpdated.targetAudience = targetAudience;
    if (startsAt) fieldToBeUpdated.startsAt = startsAt;
    if (expiresAt) fieldToBeUpdated.expiresAt = expiresAt;
    if (isActive === true || isActive === false)
      fieldToBeUpdated.isActive = isActive;

    await updateAnnouncementService({ _id: announcementId }, fieldToBeUpdated);
    return res
      .status(StatusCodes.OK)
      .send(success(200, "Announcement updated successfully!"));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function updateAnnouncementByTeacherController(req, res) {
  try {
    const teacherId = req.teacherId;
    const announcementId = req.params.announcementId;
    const {
      title,
      description,
      startsAt,
      expiresAt,
      isActive,
    } = req.body;

    const fieldToBeUpdated = {};
    if (title) fieldToBeUpdated.title = title;
    if (description) fieldToBeUpdated.description = description;
    if (startsAt) fieldToBeUpdated.startsAt = startsAt;
    if (expiresAt) fieldToBeUpdated.expiresAt = expiresAt;
    if (typeof isActive === "boolean") fieldToBeUpdated.isActive = isActive;

    const filter = {
      _id: convertToMongoId(announcementId),
      createdBy: convertToMongoId(teacherId),
      createdByRole: "teacher"
    };

    const result = await updateAnnouncementService(filter, fieldToBeUpdated);

    if (result.modifiedCount === 0) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Announcement not found."));
    }

    return res.status(StatusCodes.OK).send(success(200, "Announcement updated successfully!"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function deleteAnnouncementByAdminController(req, res) {
  try {
    const adminId = req.adminId;
    const announcementId = req.params.announcementId;

    const filter = {
      _id: convertToMongoId(announcementId),
      createdBy: convertToMongoId(adminId),
      createdByRole: "admin"
    };

    const announcement = await getAnnouncementService(filter);
    if(!announcement) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Announcement not found"));
    }

    await deleteAnnouncementService(filter);

    return res.status(StatusCodes.OK).send(success(200, "Announcement deleted successfully!"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function deleteAnnouncementByTeacherController(req, res) {
  try {
    const teacherId = req.teacherId;
    const announcementId = req.params.announcementId;

    const filter = {
      _id: convertToMongoId(announcementId),
      createdBy: convertToMongoId(teacherId),
      createdByRole: "teacher"
    };

    const announcement = await getAnnouncementService(filter);
    if(!announcement) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Announcement not found"));
    }

    await deleteAnnouncementService(filter);

    return res.status(StatusCodes.OK).send(success(200, "Announcement deleted successfully!"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getUnReadAnnouncementsCountForParentController(req, res) {
  try {
    const parentId = req.parentId || "6890f71bd9166bc74480f46b"; 
    const { studentId, createdBy = "admin" } = req.query;
    const student = await getSessionStudentService({ _id: studentId, isActive: true });
    if (!student) {
      return res
          .status(StatusCodes.NOT_FOUND)
          .send(error(404, "Student not found"));
    }

    if(!["admin", "teacher", "all"].includes(createdBy)) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Invalid Request"));
    }
    const adminId = student["school"];
    const sectionId = student["section"];

    const filter = {
      school: convertToMongoId(adminId),
      isActive: true
    };

    if (createdBy === "admin") {
      filter.createdBy = convertToMongoId(adminId);
      filter.createdByRole = "admin";
      filter.targetAudience = { $in: ["parent"] };
    }
    else if(createdBy === "teacher") {
      filter.section = convertToMongoId(sectionId);
      filter.createdByRole = "teacher";
      filter.targetAudience = { $in: ["parent"] };
    }
    else if (createdBy === "all") {
      filter.$or = [
        { createdBy: convertToMongoId(adminId), createdByRole: "admin", targetAudience: {$in: ['parent']} },
        { section: convertToMongoId(sectionId), createdByRole: "teacher", targetAudience: {$in: ['parent']} }
      ];
    }

    const pipeline = [
      {
        $match: filter,
      }
    ];

    
    const announcements = await getAnnouncementsPipelineService(pipeline);
    const announcementIds = announcements.map(a => convertToMongoId(a._id));

    const readAnnouncements = await getAnnouncementsReadStatusService({
      user: convertToMongoId(parentId),
      userRole: 'parent',
      announcement: {$in: announcementIds }
    }, {"announcement": 1});

    const readAnnouncementIds = readAnnouncements.map(r => r.announcement.toString());
    const unreadCount = announcementIds.filter(id => !readAnnouncementIds.includes(id.toString())).length;

    return res.status(200).json(success(200, { unreadCount }));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getUnReadAnnouncementsCountForTeacherController(req, res) {
  try {
    const adminId = req.adminId;
    const teacherId = req.teacherId;
    const sectionId = req.sectionId;

    const { createdBy="teacher" } = req.query;

    if(!["admin", "teacher", "all"].includes(createdBy)) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Invalid Request"));
   }

    const filter = {
      school: convertToMongoId(adminId)
    }

    if (createdBy === "admin") {
      filter.createdBy = convertToMongoId(adminId);
      filter.createdByRole = "admin";
      filter.targetAudience = { $in: ["teacher"] };
    } 
    else if(createdBy === "teacher") {
      filter.createdBy = convertToMongoId(teacherId);
      filter.createdByRole = "teacher";
    } 
    else if (createdBy === "all") {
      filter.$or = [
        { createdBy: convertToMongoId(adminId), createdByRole: "admin", targetAudience: {$in: ['teacher']} },
        { createdBy: convertToMongoId(teacherId), createdByRole: "teacher" }
      ];
    }

    const pipeline = [
      {
        $match: filter
      }
    ];

    const announcements = await getAnnouncementsPipelineService(pipeline);
    const announcementIds = announcements.map(a => convertToMongoId(a._id));
    const readAnnouncements = await getAnnouncementsReadStatusService({
      user: convertToMongoId(teacherId),
      userRole: 'teacher',
      announcement: {$in: announcementIds }
    }, {"announcement": 1});
    
    const readAnnouncementIds = readAnnouncements.map(r => r.announcement.toString());
    const unreadCount = announcementIds.filter(id => !readAnnouncementIds.includes(id.toString())).length;

    return res.status(200).json(success(200, {unreadCount}));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(success(500, err.message));
  }
}
