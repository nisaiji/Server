import {
  getAttendanceCountService,
  getAttendancePipelineService
} from "./attendance.service.js";
import {
  calculateDaysBetweenDates,
  calculateSundays
} from "./celender.service.js";
import { getExamsPipelineService } from "./exam.services.js";
import { getHolidayCountService } from "./holiday.service.js";
import { convertToMongoId } from "./mongoose.services.js";
import { getSessionService } from "./session.services.js";
import { getStudentExamResultsPipelineService } from "./studentExamResult.service.js";
import { getStudentLeaveRequestsPipelineService } from "./studentLeaveRequest.service.js";
import { getTeacherSubjectSectionPipelineService } from "./teacherSubjectSection.service.js";
import { getWorkDayCountService } from "./workDay.services.js";

const EMPTY_ATTENDANCE_STATUS = "";
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const EVALUATED_COMPONENT_STATUSES = new Set(["pass", "fail", "absent"]);
const FAIL_COMPONENT_STATUSES = new Set(["fail", "absent"]);

function getIdString(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value.toString === "function") {
    return value.toString();
  }

  return `${value}`;
}

function getTimestamp(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function compareByLatestUpdate(left, right) {
  const leftUpdatedAt = getTimestamp(left?.updatedAt) ?? 0;
  const rightUpdatedAt = getTimestamp(right?.updatedAt) ?? 0;
  if (leftUpdatedAt !== rightUpdatedAt) {
    return rightUpdatedAt - leftUpdatedAt;
  }

  const leftCreatedAt = getTimestamp(left?.createdAt) ?? 0;
  const rightCreatedAt = getTimestamp(right?.createdAt) ?? 0;
  return rightCreatedAt - leftCreatedAt;
}

function compareExams(left, right) {
  const leftStartDate = getTimestamp(left?.startDate) ?? 0;
  const rightStartDate = getTimestamp(right?.startDate) ?? 0;
  if (leftStartDate !== rightStartDate) {
    return rightStartDate - leftStartDate;
  }

  const leftCreatedAt = getTimestamp(left?.createdAt) ?? 0;
  const rightCreatedAt = getTimestamp(right?.createdAt) ?? 0;
  return rightCreatedAt - leftCreatedAt;
}

function getTeacherName(firstName, lastName) {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || null;
}

function getLatestResultsBySubject(results = []) {
  const latestBySubject = new Map();

  for (const result of results) {
    const subjectId = getIdString(result?.subject);
    if (!subjectId) {
      continue;
    }

    const existing = latestBySubject.get(subjectId);
    if (!existing || compareByLatestUpdate(existing, result) > 0) {
      latestBySubject.set(subjectId, result);
    }
  }

  return Array.from(latestBySubject.values());
}

function isEvaluatedComponent(component = {}) {
  return EVALUATED_COMPONENT_STATUSES.has(component.status);
}

function isFailingComponent(component = {}) {
  return FAIL_COMPONENT_STATUSES.has(component.status);
}

function isPassingComponent(component = {}) {
  return component.status === "pass";
}

function getMarksSummaryForExam(
  results = [],
  evaluatedSubjectCount,
  subjectCount
) {
  if (evaluatedSubjectCount === 0 || evaluatedSubjectCount < subjectCount) {
    return {};
  }

  const evaluatedComponents = [];
  for (const result of results) {
    for (const component of result?.components || []) {
      if (!isEvaluatedComponent(component)) {
        continue;
      }

      if (component.gradingType !== "marks") {
        return {};
      }

      if (
        typeof component.marksObtained !== "number" ||
        typeof component.maxMarks !== "number"
      ) {
        return {};
      }

      evaluatedComponents.push(component);
    }
  }

  if (evaluatedComponents.length === 0) {
    return {};
  }

  const totalMarksObtained = evaluatedComponents.reduce(
    (total, component) => total + component.marksObtained,
    0
  );
  const totalMaxMarks = evaluatedComponents.reduce(
    (total, component) => total + component.maxMarks,
    0
  );

  if (totalMaxMarks <= 0) {
    return {};
  }

  return {
    totalMarksObtained,
    totalMaxMarks,
    percentage: (totalMarksObtained / totalMaxMarks) * 100
  };
}

export function getDefaultAttendanceSummary() {
  return {
    currentSessionPercentage: 0,
    presentCount: 0,
    absentCount: 0,
    totalMarkedDays: 0,
    latestAttendanceStatus: null
  };
}

export function getDefaultSubjectSummary() {
  return {
    totalSubjects: 0,
    subjects: []
  };
}

export function getDefaultLeaveSummary() {
  return {
    pending: 0,
    accept: 0,
    reject: 0,
    complete: 0,
    expired: 0,
    latestRequests: []
  };
}

export function getDefaultExamSummary() {
  return {
    stats: {
      totalExams: 0,
      scheduledCount: 0,
      ongoingCount: 0,
      completedCount: 0,
      cancelledCount: 0,
      publishedResultCount: 0,
      attemptedResultCount: 0,
      passedExamCount: 0,
      failedExamCount: 0
    },
    latestExams: [],
    hasMore: false
  };
}

export async function calculateAttendancePercentageForSessionStudent(
  sessionStudentId,
  sessionId
) {
  const session = await getSessionService({ _id: convertToMongoId(sessionId) });
  const startTime = session["startDate"].getTime();
  const currentDate = new Date().getTime();
  const holidaysCount = await getHolidayCountService({
    admin: session["school"],
    date: { $gte: startTime, $lte: currentDate }
  });
  const sundayCount = calculateSundays(startTime, currentDate);
  const sundayAsWorkDayCount = await getWorkDayCountService({
    admin: session["school"],
    date: { $gte: startTime, $lte: currentDate }
  });
  const dayscount = calculateDaysBetweenDates(startTime, currentDate);
  const attendancableDays =
    dayscount - holidaysCount - sundayCount + sundayAsWorkDayCount;
  const presentDaysCount = await getAttendanceCountService({
    sessionStudent: convertToMongoId(sessionStudentId),
    teacherAttendance: "present",
    date: { $gte: startTime, $lte: currentDate }
  });

  return (presentDaysCount / attendancableDays) * 100;
}

export async function buildAttendanceSummaryForSessionStudent(
  sessionStudentId,
  sessionId
) {
  const defaultSummary = getDefaultAttendanceSummary();
  const [attendancePercentage, attendanceStats] = await Promise.all([
    calculateAttendancePercentageForSessionStudent(sessionStudentId, sessionId),
    getAttendancePipelineService([
      {
        $match: {
          sessionStudent: convertToMongoId(sessionStudentId),
          session: convertToMongoId(sessionId),
          teacherAttendance: { $ne: EMPTY_ATTENDANCE_STATUS }
        }
      },
      {
        $sort: {
          date: -1,
          createdAt: -1
        }
      },
      {
        $group: {
          _id: "$sessionStudent",
          latestAttendanceStatus: { $first: "$teacherAttendance" },
          presentCount: {
            $sum: {
              $cond: [{ $eq: ["$teacherAttendance", "present"] }, 1, 0]
            }
          },
          absentCount: {
            $sum: {
              $cond: [{ $eq: ["$teacherAttendance", "absent"] }, 1, 0]
            }
          },
          totalMarkedDays: { $sum: 1 }
        }
      }
    ])
  ]);

  const stats = attendanceStats[0];
  if (!stats) {
    return {
      ...defaultSummary,
      currentSessionPercentage: attendancePercentage
    };
  }

  return {
    currentSessionPercentage: attendancePercentage,
    presentCount: stats.presentCount ?? 0,
    absentCount: stats.absentCount ?? 0,
    totalMarkedDays: stats.totalMarkedDays ?? 0,
    latestAttendanceStatus: stats.latestAttendanceStatus ?? null
  };
}

export async function buildSubjectSummaryForContext({
  schoolId,
  sessionId,
  classId,
  sectionId
}) {
  const subjects = await getTeacherSubjectSectionPipelineService([
    {
      $match: {
        school: convertToMongoId(schoolId),
        session: convertToMongoId(sessionId),
        classId: convertToMongoId(classId),
        section: convertToMongoId(sectionId)
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
      $sort: {
        createdAt: -1
      }
    },
    {
      $group: {
        _id: "$subject._id",
        subjectId: { $first: "$subject._id" },
        subjectName: { $first: "$subject.name" },
        subjectCode: { $first: "$subject.code" },
        teacherFirstName: { $first: "$teacher.firstName" },
        teacherLastName: { $first: "$teacher.lastName" }
      }
    }
  ]);

  const filteredSubjects = subjects
    .filter((subject) => subject.subjectId)
    .map((subject) => ({
      subjectId: subject.subjectId,
      subjectName: subject.subjectName ?? "",
      subjectCode: subject.subjectCode ?? null,
      teacherName: getTeacherName(
        subject.teacherFirstName,
        subject.teacherLastName
      )
    }));

  return {
    totalSubjects: filteredSubjects.length,
    subjects: filteredSubjects
  };
}

export async function buildLeaveSummaryForSessionStudent(sessionStudentId) {
  const summaries = await getStudentLeaveRequestsPipelineService([
    {
      $match: {
        sessionStudent: convertToMongoId(sessionStudentId)
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    },
    {
      $project: {
        sessionStudent: 1,
        status: 1,
        leaveRequest: {
          leaveId: "$_id",
          leaveType: { $literal: null },
          fromDate: "$startDate",
          toDate: "$endDate",
          days: {
            $add: [
              {
                $floor: {
                  $divide: [
                    { $subtract: ["$endDate", "$startDate"] },
                    DAY_IN_MS
                  ]
                }
              },
              1
            ]
          },
          reason: { $ifNull: ["$reason", "$description"] },
          status: "$status",
          appliedAt: "$createdAt"
        }
      }
    },
    {
      $group: {
        _id: "$sessionStudent",
        pending: {
          $sum: {
            $cond: [{ $eq: ["$status", "pending"] }, 1, 0]
          }
        },
        accept: {
          $sum: {
            $cond: [{ $eq: ["$status", "accept"] }, 1, 0]
          }
        },
        reject: {
          $sum: {
            $cond: [{ $eq: ["$status", "reject"] }, 1, 0]
          }
        },
        complete: {
          $sum: {
            $cond: [{ $eq: ["$status", "complete"] }, 1, 0]
          }
        },
        expired: {
          $sum: {
            $cond: [{ $eq: ["$status", "expired"] }, 1, 0]
          }
        },
        latestRequests: { $push: "$leaveRequest" }
      }
    },
    {
      $project: {
        pending: 1,
        accept: 1,
        reject: 1,
        complete: 1,
        expired: 1,
        latestRequests: { $slice: ["$latestRequests", 5] }
      }
    }
  ]);

  const summary = summaries[0];
  if (!summary) {
    return getDefaultLeaveSummary();
  }

  return {
    pending: summary.pending ?? 0,
    accept: summary.accept ?? 0,
    reject: summary.reject ?? 0,
    complete: summary.complete ?? 0,
    expired: summary.expired ?? 0,
    latestRequests: summary.latestRequests ?? []
  };
}

export function resolveExamSummaryForStudent(
  exams = [],
  examResultsByExamId = {}
) {
  const defaultSummary = getDefaultExamSummary();
  const stats = {
    ...defaultSummary.stats,
    totalExams: exams.length
  };
  const latestExams = [];

  const sortedExams = [...exams].sort(compareExams);
  for (const exam of sortedExams) {
    const examId = getIdString(exam?._id);
    const latestResults = getLatestResultsBySubject(
      examResultsByExamId[examId] || []
    );
    const evaluatedResults = latestResults.filter((result) =>
      (result?.components || []).some((component) =>
        isEvaluatedComponent(component)
      )
    );
    const subjectCount = Array.isArray(exam?.subjects)
      ? exam.subjects.length
      : 0;
    const evaluatedSubjectCount = evaluatedResults.length;
    const hasMissingSubjects = subjectCount > evaluatedSubjectCount;
    const hasFail = evaluatedResults.some((result) =>
      (result?.components || []).some((component) =>
        isFailingComponent(component)
      )
    );
    const allEvaluatedPass =
      evaluatedSubjectCount > 0 &&
      evaluatedResults.every((result) =>
        (result?.components || [])
          .filter((component) => isEvaluatedComponent(component))
          .every((component) => isPassingComponent(component))
      );

    switch (exam?.status) {
      case "scheduled":
        stats.scheduledCount += 1;
        break;
      case "ongoing":
        stats.ongoingCount += 1;
        break;
      case "completed":
        stats.completedCount += 1;
        break;
      case "cancelled":
        stats.cancelledCount += 1;
        break;
      default:
        break;
    }

    if (exam?.resultPublished) {
      stats.publishedResultCount += 1;
    }
    if (latestResults.length > 0) {
      stats.attemptedResultCount += 1;
    }

    let overallStatus = "not_evaluated";
    if (!exam?.resultPublished) {
      overallStatus = "published_pending";
    } else if (evaluatedSubjectCount === 0) {
      overallStatus = "not_evaluated";
    } else if (hasFail) {
      overallStatus = "fail";
    } else if (hasMissingSubjects) {
      overallStatus = "partial";
    } else if (allEvaluatedPass) {
      overallStatus = "pass";
    }

    if (overallStatus === "pass") {
      stats.passedExamCount += 1;
    }
    if (overallStatus === "fail") {
      stats.failedExamCount += 1;
    }

    const examSummary = {
      examId: exam?._id ?? null,
      examName: exam?.name ?? "",
      examType: exam?.type ?? null,
      examStatus: exam?.status ?? null,
      startDate: exam?.startDate ?? null,
      endDate: exam?.endDate ?? null,
      resultPublished: Boolean(exam?.resultPublished),
      resultPublishedAt: exam?.resultPublishedAt ?? null,
      subjectCount,
      evaluatedSubjectCount,
      overallStatus
    };

    Object.assign(
      examSummary,
      getMarksSummaryForExam(latestResults, evaluatedSubjectCount, subjectCount)
    );

    latestExams.push(examSummary);
  }

  return {
    stats,
    latestExams: latestExams.slice(0, 5),
    hasMore: latestExams.length > 5
  };
}

export async function buildExamSummaryForSessionStudent({
  schoolId,
  sessionId,
  sectionId,
  sessionStudentId
}) {
  const exams = await getExamsPipelineService([
    {
      $match: {
        school: convertToMongoId(schoolId),
        session: convertToMongoId(sessionId),
        section: convertToMongoId(sectionId),
        isActive: true
      }
    },
    {
      $project: {
        school: 1,
        session: 1,
        section: 1,
        name: 1,
        type: 1,
        status: 1,
        startDate: 1,
        endDate: 1,
        resultPublished: 1,
        resultPublishedAt: 1,
        createdAt: 1,
        subjects: 1
      }
    }
  ]);

  if (exams.length === 0) {
    return getDefaultExamSummary();
  }

  const examIds = exams.map((exam) => exam._id);
  const examResults = await getStudentExamResultsPipelineService([
    {
      $match: {
        sessionStudent: convertToMongoId(sessionStudentId),
        exam: { $in: examIds.map((examId) => convertToMongoId(examId)) }
      }
    },
    {
      $project: {
        exam: 1,
        subject: 1,
        components: 1,
        createdAt: 1,
        updatedAt: 1
      }
    }
  ]);

  const examResultsByExamId = examResults.reduce((accumulator, result) => {
    const examId = getIdString(result.exam);
    if (!accumulator[examId]) {
      accumulator[examId] = [];
    }

    accumulator[examId].push(result);
    return accumulator;
  }, {});

  return resolveExamSummaryForStudent(exams, examResultsByExamId);
}
