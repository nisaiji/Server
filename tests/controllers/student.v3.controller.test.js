import { jest } from "@jest/globals";
import { StatusCodes } from "http-status-codes";

const mockGetSessionStudentsPipelineService = jest.fn();
const mockGetStartAndEndTimeService = jest.fn();
const mockConvertToMongoId = jest.fn();
const mockGetParentService = jest.fn();
const mockRegisterParentService = jest.fn();
const mockUpdateParentService = jest.fn();
const mockGetSchoolParentService = jest.fn();
const mockRegisterSchoolParentService = jest.fn();
const mockUpdateSchoolParentService = jest.fn();
const mockGetStudentService = jest.fn();
const mockGetStudentsPipelineService = jest.fn();
const mockGetStudentsService = jest.fn();
const mockRegisterStudentService = jest.fn();
const mockUpdateStudentService = jest.fn();
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
await jest.unstable_mockModule("../../src/services/v2/parent.services.js", () => ({
  getParentService: mockGetParentService,
  registerParentService: mockRegisterParentService,
  updateParentService: mockUpdateParentService,
}));
await jest.unstable_mockModule("../../src/services/v2/schoolParent.services.js", () => ({
  getSchoolParentService: mockGetSchoolParentService,
  registerSchoolParentService: mockRegisterSchoolParentService,
  updateSchoolParentService: mockUpdateSchoolParentService,
}));
await jest.unstable_mockModule("../../src/services/student.service.js", () => ({
  getStudentService: mockGetStudentService,
  getStudentsPipelineService: mockGetStudentsPipelineService,
  getStudentsService: mockGetStudentsService,
  registerStudentService: mockRegisterStudentService,
  updateStudentService: mockUpdateStudentService,
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
  updateStudentBySchoolController,
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
      params: {
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
    req.params = {};

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

describe("updateStudentBySchoolController", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      adminId: "65d92f2b5e5c110010d10d93",
      params: {
        studentId: "65d92f2b5e5c110010d10d80",
      },
      body: {
        parentDob: "1988-04-01",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
    mockSuccess.mockImplementation((code, data) => ({ code, data }));
    mockError.mockImplementation((code, message) => ({ code, message }));
  });

  test("updates parent dob on the canonical parent record", async () => {
    mockGetStudentService
      .mockResolvedValueOnce({
        _id: req.params.studentId,
        parent: "65d92f2b5e5c110010d10d81",
        schoolParent: "65d92f2b5e5c110010d10d82",
      })
      .mockResolvedValueOnce(null);
    mockGetSchoolParentService.mockResolvedValue({
      _id: "65d92f2b5e5c110010d10d82",
      parent: "65d92f2b5e5c110010d10d81",
      phone: "9876543210",
    });
    mockGetParentService.mockResolvedValue({
      _id: "65d92f2b5e5c110010d10d81",
      phone: "9876543210",
      students: [],
    });
    mockUpdateStudentService.mockResolvedValue({ acknowledged: true });
    mockUpdateSchoolParentService.mockResolvedValue({ acknowledged: true });
    mockUpdateParentService.mockResolvedValue({ acknowledged: true });

    await updateStudentBySchoolController(req, res);

    expect(mockUpdateParentService).toHaveBeenCalledWith(
      { _id: "65d92f2b5e5c110010d10d81" },
      { dob: "1988-04-01" }
    );
    expect(mockUpdateSchoolParentService).toHaveBeenCalledWith(
      { _id: "65d92f2b5e5c110010d10d82" },
      {}
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith({
      code: 200,
      data: "Student updated successfully",
    });
  });
});
