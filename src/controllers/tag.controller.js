import { StatusCodes } from "http-status-codes";
import { sendPushNotification } from "../config/firebase.config.js";
import {
  getFormattedDateService,
  getStartAndEndTimeService,
  timestampToIstDate
} from "../services/celender.service.js";
import { convertToMongoId } from "../services/mongoose.services.js";
import {
  dedupeNotificationRecipientsService,
  getSectionParentNotificationRecipientsService,
  getTagTeacherNotificationRecipientsService
} from "../services/notificationRecipient.service.js";
import { getSessionService } from "../services/session.services.js";
import { getSubjectService } from "../services/subject.service.js";
import {
  createTagService,
  deleteTagService,
  getTagService,
  getTagsPipelineService,
  updateTagService
} from "../services/tag.service.js";
import { getTeacherSubjectSectionService } from "../services/teacherSubjectSection.service.js";
import { error, success } from "../utils/responseWrapper.js";

function getTagNotificationRangeLabel(startDate, endDate) {
  const startLabel = getFormattedDateService(startDate);
  const endLabel = getFormattedDateService(endDate);

  if (startLabel === endLabel) {
    return startLabel;
  }

  return `${startLabel} to ${endLabel}`;
}

export async function createTagController(req, res) {
  try {
    let {
      subjectId,
      sectionId,
      sessionId,
      startDate,
      endDate,
      classId,
      title,
      description
    } = req.body;
    const teacherId = req.teacherId;
    const schoolId = req.adminId;
    startDate = parseInt(startDate);
    endDate = parseInt(endDate);

    if (startDate > endDate) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(error(400, "Start date must be less than end date"));
    }

    const session = await getSessionService({ _id: sessionId });

    if (!session || session["status"] === "completed") {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(error(404, "Session is completed. You cannot create tag"));
    }

    const subject = await getSubjectService({ _id: subjectId });
    if (!subject) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(error(404, "Subject not found"));
    }
    const teacherSubjectSection = await getTeacherSubjectSectionService({
      teacher: teacherId,
      subject: subjectId,
      section: sectionId,
      session: sessionId,
      school: schoolId
    });
    if (!teacherSubjectSection) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(error(404, "Teacher is not authorized for this action"));
    }

    let startIstDate = timestampToIstDate(startDate);
    let endIstDate = timestampToIstDate(endDate);
    const { startTime: tempStartTimestamp, endTime: tempEndTimestamp } =
      getStartAndEndTimeService(startIstDate, endIstDate);

    startIstDate = timestampToIstDate(tempStartTimestamp);
    endIstDate = timestampToIstDate(tempEndTimestamp);
    const notificationStartDate = new Date(startIstDate);
    const notificationEndDate = new Date(endIstDate);

    let currIstDate = startIstDate;
    while (currIstDate <= endIstDate) {
      await createTagService({
        teacher: teacherId,
        subject: subjectId,
        section: sectionId,
        session: sessionId,
        classId,
        title,
        description,
        date: currIstDate,
        school: schoolId
      });
      currIstDate.setDate(currIstDate.getDate() + 1);
    }

    const [parentRecipients, teacherRecipients] = await Promise.all([
      getSectionParentNotificationRecipientsService({
        sectionId,
        sessionId,
        schoolId
      }),
      getTagTeacherNotificationRecipientsService({
        sectionId,
        subjectId,
        sessionId,
        schoolId,
        excludeTeacherId: teacherId
      })
    ]);

    const recipients = dedupeNotificationRecipientsService([
      ...parentRecipients,
      ...teacherRecipients
    ]);

    const notificationBody = `${title} has been added for ${subject?.name ?? "the subject"} from ${getTagNotificationRangeLabel(notificationStartDate, notificationEndDate)}.`;

    await Promise.allSettled(
      recipients.map((recipient) =>
        sendPushNotification(
          recipient.fcmToken,
          "New Tag Added",
          notificationBody,
          "tag"
        )
      )
    );

    return res
      .status(StatusCodes.CREATED)
      .send(success(201, "Tag created successfully"));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function updateTagController(req, res) {
  try {
    const tagId = req.params.tagId;
    const { title, description, date } = req.body;
    const teacherId = req.teacherId;
    const schoolId = req.adminId;
    const tag = await getTagService({
      _id: tagId,
      teacher: teacherId,
      school: schoolId
    });
    const session = await getSessionService({ _id: tag.session });
    if (!tag) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(error(404, "Tag not found"));
    }
    if (!session || session["status"] === "completed") {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(error(404, "Session is completed. You cannot update tag"));
    }
    const params = {};
    if (title) params.title = title;
    if (description) params.description = description;
    if (date) params.date = date;
    await updateTagService({ _id: convertToMongoId(tagId) }, params);
    return res
      .status(StatusCodes.CREATED)
      .send(success(200, "Tag updated successfully"));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function deleteTagController(req, res) {
  try {
    const tagId = req.params.tagId;
    const teacherId = req.teacherId;
    const schoolId = req.adminId;
    const tag = await getTagService({
      _id: tagId,
      teacher: teacherId,
      school: schoolId
    });
    const session = await getSessionService({ _id: tag.session });
    if (!tag) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(error(404, "Tag not found"));
    }
    if (!session || session["status"] === "completed") {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(error(404, "Session is completed. You cannot update event"));
    }
    await deleteTagService({ _id: convertToMongoId(tagId) });
    return res
      .status(StatusCodes.CREATED)
      .send(success(200, "Tag deleted successfully"));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function getTagsController(req, res) {
  try {
    const { sectionId, sessionId, subjectId, startTime, endTime } = req.body;
    const teacherId = req.teacherId;
    const tags = await getTagsPipelineService([
      {
        $match: {
          teacher: convertToMongoId(teacherId),
          session: convertToMongoId(sessionId),
          section: convertToMongoId(sectionId),
          subject: convertToMongoId(subjectId),
          date: { $gte: startTime, $lte: endTime }
        }
      }
    ]);
    return res.status(StatusCodes.OK).send(success(200, tags));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function getTagsWithInfoController(req, res) {
  try {
    const { sectionId, startTime, endTime } = req.body;
    const tags = await getTagsPipelineService([
      {
        $match: {
          section: convertToMongoId(sectionId),
          date: { $gte: startTime, $lte: endTime }
        }
      },
      {
        $lookup: {
          from: "teachers",
          localField: "teacher",
          foreignField: "_id",
          as: "teacher"
        }
      },
      {
        $unwind: {
          path: "$teacher",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subject"
        }
      },
      {
        $unwind: {
          path: "$subject",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "sections",
          localField: "section",
          foreignField: "_id",
          as: "section"
        }
      },
      {
        $unwind: {
          path: "$section",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "classes",
          localField: "classId",
          foreignField: "_id",
          as: "class"
        }
      },
      {
        $unwind: {
          path: "$class",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "sessions",
          localField: "session",
          foreignField: "_id",
          as: "session"
        }
      },
      {
        $unwind: {
          path: "$session",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "admins",
          localField: "school",
          foreignField: "_id",
          as: "school"
        }
      },
      {
        $unwind: {
          path: "$school",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          tagId: "$_id",
          title: "$title",
          description: "$description",
          date: "$date",
          // isCompleted: '$isCompleted',
          // createdAt: '$createdAt',
          // teacherId: '$teacher._id',
          // teacherFirstName: '$teacher.firstName',
          // teacherLastName: '$teacher.lastName',
          // teacherEmail: '$teacher.email',
          // teacherGender: '$teacher.gender',
          // teacherPhone: '$teacher.phone',
          // teacherPhoto: '$teacher.photo',
          // subjectId: '$subject._id',
          subjectName: "$subject.name",
          subjectCode: "$subject.code"
          // sectionId: '$section._id',
          // sectionName: '$section.name',
          // classId: '$class._id',
          // className: '$class.name',
          // sessionId: '$session._id',
          // sessionStartDate: '$session.startDate',
          // sessionEndDate: '$session.endDate',
          // isCurrentSession: '$session.isCurrent',
          // sessionStatus: '$session.status',
          // schoolId: '$school._id',
          // schoolName: '$school.schoolName',
          // schoolPhoto: '$school.photo'
        }
      },
      {
        $project: {
          _id: 0,
          teacher: 0,
          subject: 0,
          section: 0,
          classId: 0,
          session: 0,
          school: 0
        }
      }
    ]);
    return res.status(StatusCodes.OK).send(success(200, tags));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}
