import { jest } from "@jest/globals";
import { calculateDaysBetweenDates, calculateSundays } from "../../src/services/celender.service.js";

const mockGetAttendanceCountService = jest.fn();
const mockGetAttendancePipelineService = jest.fn();
const mockGetExamsPipelineService = jest.fn();
const mockGetHolidayCountService = jest.fn();
const mockConvertToMongoId = jest.fn();
const mockGetSessionService = jest.fn();
const mockGetStudentExamResultsPipelineService = jest.fn();
const mockGetStudentLeaveRequestsPipelineService = jest.fn();
const mockGetTeacherSubjectSectionPipelineService = jest.fn();
const mockGetWorkDayCountService = jest.fn();

await jest.unstable_mockModule("../../src/services/attendance.service.js", () => ({
  getAttendanceCountService: mockGetAttendanceCountService,
  getAttendancePipelineService: mockGetAttendancePipelineService,
}));
await jest.unstable_mockModule("../../src/services/exam.services.js", () => ({
  getExamsPipelineService: mockGetExamsPipelineService,
}));
await jest.unstable_mockModule("../../src/services/holiday.service.js", () => ({
  getHolidayCountService: mockGetHolidayCountService,
}));
await jest.unstable_mockModule("../../src/services/mongoose.services.js", () => ({
  convertToMongoId: mockConvertToMongoId,
}));
await jest.unstable_mockModule("../../src/services/session.services.js", () => ({
  getSessionService: mockGetSessionService,
}));
await jest.unstable_mockModule("../../src/services/studentExamResult.service.js", () => ({
  getStudentExamResultsPipelineService: mockGetStudentExamResultsPipelineService,
}));
await jest.unstable_mockModule("../../src/services/studentLeaveRequest.service.js", () => ({
  getStudentLeaveRequestsPipelineService: mockGetStudentLeaveRequestsPipelineService,
}));
await jest.unstable_mockModule("../../src/services/teacherSubjectSection.service.js", () => ({
  getTeacherSubjectSectionPipelineService: mockGetTeacherSubjectSectionPipelineService,
}));
await jest.unstable_mockModule("../../src/services/workDay.services.js", () => ({
  getWorkDayCountService: mockGetWorkDayCountService,
}));

const {
  buildAttendanceSummaryForSessionStudent,
  buildLeaveSummaryForSessionStudent,
  buildSubjectSummaryForContext,
  resolveExamSummaryForStudent,
} = await import("../../src/services/studentDetailSummary.service.js");

describe("buildAttendanceSummaryForSessionStudent", () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test("returns attendance counts and reuses the canonical percentage formula", async () => {
    const currentTime = new Date("2026-04-22T00:00:00.000Z");
    const startDate = new Date("2026-04-01T00:00:00.000Z");
    const sessionStudentId = "65d92f2b5e5c110010d10d80";
    const sessionId = "65d92f2b5e5c110010d10d82";

    jest.useFakeTimers();
    jest.setSystemTime(currentTime);
    mockConvertToMongoId.mockImplementation((value) => value);
    mockGetSessionService.mockResolvedValue({
      startDate,
      school: "65d92f2b5e5c110010d10d93",
    });
    mockGetHolidayCountService.mockResolvedValue(1);
    mockGetWorkDayCountService.mockResolvedValue(1);
    mockGetAttendanceCountService.mockResolvedValue(8);
    mockGetAttendancePipelineService.mockResolvedValue([
      {
        _id: sessionStudentId,
        presentCount: 8,
        absentCount: 2,
        totalMarkedDays: 10,
        latestAttendanceStatus: "present",
      },
    ]);

    const summary = await buildAttendanceSummaryForSessionStudent(sessionStudentId, sessionId);
    const startTime = startDate.getTime();
    const endTime = currentTime.getTime();
    const expectedDays =
      calculateDaysBetweenDates(startTime, endTime) -
      calculateSundays(startTime, endTime) -
      1 +
      1;

    expect(summary).toEqual({
      currentSessionPercentage: (8 / expectedDays) * 100,
      presentCount: 8,
      absentCount: 2,
      totalMarkedDays: 10,
      latestAttendanceStatus: "present",
    });
  });
});

describe("buildSubjectSummaryForContext", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("deduplicates subjects and maps teacher name", async () => {
    mockConvertToMongoId.mockImplementation((value) => value);
    mockGetTeacherSubjectSectionPipelineService.mockResolvedValue([
      {
        _id: "subject-1",
        subjectId: "subject-1",
        subjectName: "Mathematics",
        subjectCode: "MATH-01",
        teacherFirstName: "Aman",
        teacherLastName: "Singh",
      },
    ]);

    const summary = await buildSubjectSummaryForContext({
      schoolId: "school-1",
      sessionId: "session-1",
      classId: "class-1",
      sectionId: "section-1",
    });

    expect(summary).toEqual({
      totalSubjects: 1,
      subjects: [
        {
          subjectId: "subject-1",
          subjectName: "Mathematics",
          subjectCode: "MATH-01",
          teacherName: "Aman Singh",
        },
      ],
    });
  });
});

describe("buildLeaveSummaryForSessionStudent", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("keeps leaveType null and maps reason from the real schema fields", async () => {
    const sessionStudentId = "65d92f2b5e5c110010d10d80";
    mockConvertToMongoId.mockImplementation((value) => value);
    mockGetStudentLeaveRequestsPipelineService.mockResolvedValue([
      {
        _id: sessionStudentId,
        pending: 1,
        accept: 0,
        reject: 0,
        complete: 0,
        expired: 0,
        latestRequests: [
          {
            leaveId: "leave-1",
            leaveType: null,
            fromDate: 1712448000000,
            toDate: 1712534400000,
            days: 2,
            reason: "Medical",
            status: "pending",
            appliedAt: new Date("2026-04-01T00:00:00.000Z"),
          },
        ],
      },
    ]);

    const summary = await buildLeaveSummaryForSessionStudent(sessionStudentId);
    const pipeline = mockGetStudentLeaveRequestsPipelineService.mock.calls[0][0];

    expect(pipeline[2].$project.leaveRequest.leaveType.$literal).toBeNull();
    expect(pipeline[2].$project.leaveRequest.reason.$ifNull).toEqual(["$reason", "$description"]);
    expect(summary.latestRequests[0].leaveType).toBeNull();
    expect(summary.latestRequests[0].reason).toBe("Medical");
  });
});

describe("resolveExamSummaryForStudent", () => {
  const baseExam = {
    _id: "exam-1",
    name: "Mid Term",
    type: "exam",
    status: "completed",
    startDate: new Date("2026-04-10T00:00:00.000Z"),
    endDate: new Date("2026-04-12T00:00:00.000Z"),
    createdAt: new Date("2026-04-01T00:00:00.000Z"),
    resultPublished: true,
    resultPublishedAt: new Date("2026-04-20T00:00:00.000Z"),
    subjects: [{ subject: "sub1" }, { subject: "sub2" }],
  };

  test("returns published_pending for unpublished exams", () => {
    const summary = resolveExamSummaryForStudent(
      [{ ...baseExam, resultPublished: false }],
      {}
    );

    expect(summary.latestExams[0].overallStatus).toBe("published_pending");
  });

  test("returns not_evaluated when published exams have no evaluated result data", () => {
    const summary = resolveExamSummaryForStudent(
      [baseExam],
      {
        "exam-1": [
          {
            subject: "sub1",
            components: [{ status: "pending", gradingType: "marks" }],
            updatedAt: new Date("2026-04-21T00:00:00.000Z"),
          },
        ],
      }
    );

    expect(summary.latestExams[0].overallStatus).toBe("not_evaluated");
  });

  test("returns fail when any evaluated component fails", () => {
    const summary = resolveExamSummaryForStudent(
      [baseExam],
      {
        "exam-1": [
          {
            subject: "sub1",
            components: [{ status: "fail", gradingType: "marks", marksObtained: 10, maxMarks: 50 }],
            updatedAt: new Date("2026-04-21T00:00:00.000Z"),
          },
          {
            subject: "sub2",
            components: [{ status: "pass", gradingType: "marks", marksObtained: 45, maxMarks: 50 }],
            updatedAt: new Date("2026-04-21T00:00:00.000Z"),
          },
        ],
      }
    );

    expect(summary.latestExams[0].overallStatus).toBe("fail");
  });

  test("returns partial only when some required subjects are evaluated and some are missing", () => {
    const summary = resolveExamSummaryForStudent(
      [baseExam],
      {
        "exam-1": [
          {
            subject: "sub1",
            components: [{ status: "pass", gradingType: "marks", marksObtained: 45, maxMarks: 50 }],
            updatedAt: new Date("2026-04-21T00:00:00.000Z"),
          },
        ],
      }
    );

    expect(summary.latestExams[0].overallStatus).toBe("partial");
  });

  test("returns pass when all evaluated components pass", () => {
    const summary = resolveExamSummaryForStudent(
      [baseExam],
      {
        "exam-1": [
          {
            subject: "sub1",
            components: [{ status: "pass", gradingType: "marks", marksObtained: 45, maxMarks: 50 }],
            updatedAt: new Date("2026-04-21T00:00:00.000Z"),
          },
          {
            subject: "sub2",
            components: [{ status: "pass", gradingType: "marks", marksObtained: 48, maxMarks: 50 }],
            updatedAt: new Date("2026-04-21T00:00:00.000Z"),
          },
        ],
      }
    );

    expect(summary.latestExams[0].overallStatus).toBe("pass");
    expect(summary.latestExams[0].totalMarksObtained).toBe(93);
    expect(summary.latestExams[0].totalMaxMarks).toBe(100);
  });

  test("omits marks totals when marks data is incomplete", () => {
    const summary = resolveExamSummaryForStudent(
      [baseExam],
      {
        "exam-1": [
          {
            subject: "sub1",
            components: [{ status: "pass", gradingType: "marks", maxMarks: 50 }],
            updatedAt: new Date("2026-04-21T00:00:00.000Z"),
          },
          {
            subject: "sub2",
            components: [{ status: "pass", gradingType: "marks", marksObtained: 48, maxMarks: 50 }],
            updatedAt: new Date("2026-04-21T00:00:00.000Z"),
          },
        ],
      }
    );

    expect(summary.latestExams[0].totalMarksObtained).toBeUndefined();
    expect(summary.latestExams[0].totalMaxMarks).toBeUndefined();
    expect(summary.latestExams[0].percentage).toBeUndefined();
  });
});
