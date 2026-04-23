import { jest } from "@jest/globals";
import { StatusCodes } from "http-status-codes";

const mockGetSessionStudentsPipelineService = jest.fn();
const mockGetStartAndEndTimeService = jest.fn();
const mockConvertToMongoId = jest.fn();
const mockBuildAttendanceSummaryForSessionStudent = jest.fn();
const mockBuildSubjectSummaryForContext = jest.fn();
const mockBuildLeaveSummaryForSessionStudent = jest.fn();
const mockBuildExamSummaryForSessionStudent = jest.fn();
const mockCalculateAttendancePercentageForSessionStudent = jest.fn();
const mockSuccess = jest.fn();
const mockError = jest.fn();

await jest.unstable_mockModule("../../src/services/v2/sessionStudent.service.js", () => ({
  getSessionStudentService: jest.fn(),
  getSessionStudentsPipelineService: mockGetSessionStudentsPipelineService,
  registerSessionStudentService: jest.fn(),
  updateSessionStudentService: jest.fn(),
}));
await jest.unstable_mockModule("../../src/services/celender.service.js", () => ({
  getStartAndEndTimeService: mockGetStartAndEndTimeService,
  excelDateToStringDateFormat: jest.fn(),
}));
await jest.unstable_mockModule("../../src/services/mongoose.services.js", () => ({
  convertToMongoId: mockConvertToMongoId,
}));
await jest.unstable_mockModule("../../src/services/studentDetailSummary.service.js", () => ({
  buildAttendanceSummaryForSessionStudent: mockBuildAttendanceSummaryForSessionStudent,
  buildSubjectSummaryForContext: mockBuildSubjectSummaryForContext,
  buildLeaveSummaryForSessionStudent: mockBuildLeaveSummaryForSessionStudent,
  buildExamSummaryForSessionStudent: mockBuildExamSummaryForSessionStudent,
  calculateAttendancePercentageForSessionStudent: mockCalculateAttendancePercentageForSessionStudent,
}));
await jest.unstable_mockModule("../../src/utills/responseWrapper.js", () => ({
  success: mockSuccess,
  error: mockError,
}));

const {
  getAdminStudentDetailController,
  searchStudentsController,
} = await import("../../src/controllers/v3/student.controller.js");

describe("getAdminStudentDetailController", () => {
  const adminId = "65d92f2b5e5c110010d10d93";
  const studentRow = {
    _id: "65d92f2b5e5c110010d10d80",
    id: "65d92f2b5e5c110010d10d81",
    firstname: "John",
    sessionId: "65d92f2b5e5c110010d10d82",
    classId: "65d92f2b5e5c110010d10d83",
    sectionId: "65d92f2b5e5c110010d10d84",
  };
  let req;
  let res;

  beforeEach(() => {
    req = {
      adminId,
      query: {
        sessionStudentId: studentRow._id,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
    mockConvertToMongoId.mockImplementation((value) => value);
    mockGetStartAndEndTimeService.mockReturnValue({ startTime: 1, endTime: 2 });
    mockSuccess.mockImplementation((code, data) => ({ code, data }));
    mockError.mockImplementation((code, message) => ({ code, message }));
  });

  test("returns one detailed student with summary blocks", async () => {
    mockGetSessionStudentsPipelineService.mockResolvedValue([{ ...studentRow }]);
    mockBuildAttendanceSummaryForSessionStudent.mockResolvedValue({
      currentSessionPercentage: 91,
      presentCount: 10,
      absentCount: 1,
      totalMarkedDays: 11,
      latestAttendanceStatus: "present",
    });
    mockBuildSubjectSummaryForContext.mockResolvedValue({
      totalSubjects: 1,
      subjects: [
        {
          subjectId: "65d92f2b5e5c110010d10d90",
          subjectName: "Mathematics",
          subjectCode: "MATH-01",
          teacherName: "Aman Singh",
        },
      ],
    });
    mockBuildLeaveSummaryForSessionStudent.mockResolvedValue({
      pending: 1,
      accept: 0,
      reject: 0,
      complete: 0,
      expired: 0,
      latestRequests: [],
    });
    mockBuildExamSummaryForSessionStudent.mockResolvedValue({
      stats: {
        totalExams: 2,
        scheduledCount: 1,
        ongoingCount: 0,
        completedCount: 1,
        cancelledCount: 0,
        publishedResultCount: 1,
        attemptedResultCount: 1,
        passedExamCount: 1,
        failedExamCount: 0,
      },
      latestExams: [],
      hasMore: false,
    });

    await getAdminStudentDetailController(req, res);

    expect(mockGetSessionStudentsPipelineService).toHaveBeenCalledTimes(1);
    expect(mockBuildAttendanceSummaryForSessionStudent).toHaveBeenCalledWith(
      studentRow._id,
      studentRow.sessionId
    );
    expect(mockBuildSubjectSummaryForContext).toHaveBeenCalledWith({
      schoolId: adminId,
      sessionId: studentRow.sessionId,
      classId: studentRow.classId,
      sectionId: studentRow.sectionId,
    });
    expect(mockBuildLeaveSummaryForSessionStudent).toHaveBeenCalledWith(studentRow._id);
    expect(mockBuildExamSummaryForSessionStudent).toHaveBeenCalledWith({
      schoolId: adminId,
      sessionId: studentRow.sessionId,
      sectionId: studentRow.sectionId,
      sessionStudentId: studentRow._id,
    });

    const payload = res.send.mock.calls[0][0];
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(payload.code).toBe(200);
    expect(payload.data).toEqual(
      expect.objectContaining({
        attendancePercentage: 91,
        attendanceSummary: expect.objectContaining({
          currentSessionPercentage: 91,
          presentCount: 10,
        }),
        subjectSummary: expect.objectContaining({ totalSubjects: 1 }),
        leaveSummary: expect.objectContaining({ pending: 1 }),
        examSummary: expect.objectContaining({
          stats: expect.objectContaining({ totalExams: 2 }),
        }),
      })
    );
  });

  test("returns 400 when sessionStudentId is missing", async () => {
    req.query = {};

    await getAdminStudentDetailController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.send).toHaveBeenCalledWith({
      code: 400,
      message: "sessionStudentId is required",
    });
    expect(mockGetSessionStudentsPipelineService).not.toHaveBeenCalled();
  });

  test.each([
    "missing student",
    "inactive student",
    "student from another school",
  ])("returns 404 for %s", async () => {
    mockGetSessionStudentsPipelineService.mockResolvedValue([]);

    await getAdminStudentDetailController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith({ code: 404, message: "Student not found" });
    expect(mockBuildAttendanceSummaryForSessionStudent).not.toHaveBeenCalled();
    expect(mockBuildSubjectSummaryForContext).not.toHaveBeenCalled();
    expect(mockBuildLeaveSummaryForSessionStudent).not.toHaveBeenCalled();
    expect(mockBuildExamSummaryForSessionStudent).not.toHaveBeenCalled();
  });
});

describe("searchStudentsController", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      adminId: "65d92f2b5e5c110010d10d93",
      query: {
        page: "1",
        limit: "2",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
    mockConvertToMongoId.mockImplementation((value) => value);
    mockGetStartAndEndTimeService.mockReturnValue({ startTime: 1, endTime: 2 });
    mockSuccess.mockImplementation((code, data) => ({ code, data }));
    mockError.mockImplementation((code, message) => ({ code, message }));
  });

  test("keeps the existing admin list response lean", async () => {
    mockGetSessionStudentsPipelineService.mockResolvedValue([
      {
        _id: "65d92f2b5e5c110010d10d80",
        firstname: "John",
        sessionId: "65d92f2b5e5c110010d10d82",
      },
    ]);
    mockCalculateAttendancePercentageForSessionStudent.mockResolvedValue(88);

    await searchStudentsController(req, res);

    const payload = res.send.mock.calls[0][0];
    const student = payload.data.students[0];
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(payload.code).toBe(200);
    expect(student.attendancePercentage).toBe(88);
    expect(student.attendanceSummary).toBeUndefined();
    expect(student.subjectSummary).toBeUndefined();
    expect(student.leaveSummary).toBeUndefined();
    expect(student.examSummary).toBeUndefined();
    expect(mockBuildAttendanceSummaryForSessionStudent).not.toHaveBeenCalled();
  });
});
