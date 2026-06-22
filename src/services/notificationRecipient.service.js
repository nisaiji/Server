import sessionStudentModel from "../models/sessionStudent.model.js";
import teacherSubjectSectionModel from "../models/teacherSubjectSection.model.js";
import sessionStudentModel from "../models/v2/sessionStudent.model.js";

function buildRecipientMatch(fieldName, excludeRecipientId) {
  const match = {};

  if (excludeRecipientId) {
    match[fieldName] = { $ne: convertToMongoId(excludeRecipientId) };
  }

  return match;
}

function normalizeSubjectIds(subjectIds = []) {
  return subjectIds
    .map((subjectId) => {
      if (!subjectId) {
        return null;
      }

      return convertToMongoId(subjectId);
    })
    .filter(Boolean);
}

export function dedupeNotificationRecipientsService(recipients = []) {
  const seenTokens = new Set();

  return recipients.filter((recipient) => {
    const token = recipient?.fcmToken?.trim();

    if (!token || seenTokens.has(token)) {
      return false;
    }

    seenTokens.add(token);
    return true;
  });
}

export async function getSectionParentNotificationRecipientsService({
  sectionId,
  sessionId,
  schoolId
}) {
  try {
    const recipients = await sessionStudentModel.aggregate([
      {
        $match: {
          section: convertToMongoId(sectionId),
          session: convertToMongoId(sessionId),
          school: convertToMongoId(schoolId),
          isActive: true
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "student"
        }
      },
      {
        $unwind: {
          path: "$student",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $lookup: {
          from: "schoolparents",
          localField: "student.schoolParent",
          foreignField: "_id",
          as: "schoolParent"
        }
      },
      {
        $unwind: {
          path: "$schoolParent",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $match: {
          "schoolParent.isActive": true
        }
      },
      {
        $lookup: {
          from: "parents",
          localField: "schoolParent.parent",
          foreignField: "_id",
          as: "parent"
        }
      },
      {
        $unwind: {
          path: "$parent",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $match: {
          "parent.isActive": true,
          "parent.fcmToken": {
            $type: "string",
            $ne: ""
          }
        }
      },
      {
        $project: {
          _id: 0,
          recipientId: "$parent._id",
          fullname: "$parent.fullname",
          fcmToken: "$parent.fcmToken",
          role: {
            $literal: "parent"
          }
        }
      }
    ]);

    return dedupeNotificationRecipientsService(recipients);
  } catch (error) {
    throw error;
  }
}

async function getTeacherNotificationRecipientsService({
  sectionId,
  sessionId,
  schoolId,
  subjectIds,
  excludeTeacherId
}) {
  const normalizedSubjectIds = normalizeSubjectIds(subjectIds);

  if (!normalizedSubjectIds.length) {
    return [];
  }

  const teacherRecipientMatch = buildRecipientMatch("teacher", excludeTeacherId);

  try {
    const recipients = await teacherSubjectSectionModel.aggregate([
      {
        $match: {
          section: convertToMongoId(sectionId),
          session: convertToMongoId(sessionId),
          school: convertToMongoId(schoolId),
          subject: { $in: normalizedSubjectIds },
          ...teacherRecipientMatch
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
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $match: {
          "teacher.isActive": true,
          "teacher.fcmToken": {
            $type: "string",
            $ne: ""
          }
        }
      },
      {
        $project: {
          _id: 0,
          recipientId: "$teacher._id",
          firstname: "$teacher.firstname",
          lastname: "$teacher.lastname",
          fcmToken: "$teacher.fcmToken",
          role: {
            $literal: "teacher"
          }
        }
      }
    ]);

    return dedupeNotificationRecipientsService(recipients);
  } catch (error) {
    throw error;
  }
}

export async function getTagTeacherNotificationRecipientsService({
  sectionId,
  subjectId,
  sessionId,
  schoolId,
  excludeTeacherId
}) {
  return getTeacherNotificationRecipientsService({
    sectionId,
    sessionId,
    schoolId,
    subjectIds: [subjectId],
    excludeTeacherId
  });
}

export async function getExamTeacherNotificationRecipientsService({
  sectionId,
  sessionId,
  schoolId,
  subjectIds,
  excludeTeacherId
}) {
  return getTeacherNotificationRecipientsService({
    sectionId,
    sessionId,
    schoolId,
    subjectIds,
    excludeTeacherId
  });
}
