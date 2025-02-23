import { StatusCodes } from "http-status-codes";
import { getPresentStudentsController, getParentCountController, getTeacherCountController, attendanceStatusOfSectionController, attendanceStatusController } from "../../src/controllers/dashboardAdmin.controller.js";
import { getAttendanceCountService } from "../../src/services/attendance.service.js";
import { getSectionAttendanceStatusService, getSectionAttendancesPipelineService } from "../../src/services/sectionAttendance.services.js";
import { getStudentCountService, getStudentsPipelineService } from "../../src/services/student.service.js";
import { getTeacherCountService } from "../../src/services/teacher.services.js";
import { getSectionService } from "../../src/services/section.services.js";
import { convertToMongoId } from "../../src/services/mongoose.services.js";
import { success, error } from "../../src/utills/responseWrapper.js";

jest.mock("../../src/services/attendance.service.js");
jest.mock("../../src/services/student.service.js");
jest.mock("../../src/services/mongoose.services.js");
jest.mock("../../src/services/teacher.services.js");
jest.mock("../../src/services/section.services.js");
jest.mock("../../src/services/sectionAttendance.services.js");

describe("getPresentStudentsController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      adminId: "admin123",
      body: {
        startTime: "2025-01-01T00:00:00.000Z",
        endTime: "2025-01-31T23:59:59.999Z",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should send success response with attendance counts", async () => {
    getAttendanceCountService
      .mockResolvedValueOnce(20)
      .mockResolvedValueOnce(5);
    getStudentCountService.mockResolvedValueOnce(30);

    await getPresentStudentsController(req, res);

    expect(getAttendanceCountService).toHaveBeenNthCalledWith(1, {
      admin: req.adminId,
      date: { $gte: req.body.startTime, $lte: req.body.endTime },
      teacherAttendance: "present",
    });
    expect(getAttendanceCountService).toHaveBeenNthCalledWith(2, {
      admin: req.adminId,
      date: { $gte: req.body.startTime, $lte: req.body.endTime },
      teacherAttendance: "absent",
    });
    expect(getStudentCountService).toHaveBeenCalledWith({
      admin: req.adminId,
      isActive: true,
    });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(
      success(200, { presentCount: 20, absentCount: 5, totalCount: 30 })
    );
  });

  test("should send error response when a service call fails", async () => {
    const errorMessage = "Service failure";
    getAttendanceCountService.mockRejectedValueOnce(new Error(errorMessage));

    await getPresentStudentsController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, errorMessage));
  });
});

describe("getParentCountController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      adminId: "admin123",
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    convertToMongoId.mockImplementation((id) => id);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should send success response with parent count", async () => {
    getStudentsPipelineService.mockResolvedValueOnce([{ totalParent: 10 }]);

    await getParentCountController(req, res);

    expect(getStudentsPipelineService).toHaveBeenCalledWith([
      { $match: { admin: "admin123" } },
      { $group: { _id: "$parent" } },
      { $count: "totalParent" },
    ]);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, { parentCount: 10 }));
  });

  test("should return 0 when no parents are found", async () => {
    getStudentsPipelineService.mockResolvedValueOnce([]);

    await getParentCountController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, { parentCount: 0 }));
  });

  test("should send error response when service call fails", async () => {
    const errorMessage = "Service failure";
    getStudentsPipelineService.mockRejectedValueOnce(new Error(errorMessage));

    await getParentCountController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, errorMessage));
  });
});

describe("getTeacherCountController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      adminId: "admin123",
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should send success response with teacher count", async () => {
    getTeacherCountService.mockResolvedValueOnce(15);

    await getTeacherCountController(req, res);

    expect(getTeacherCountService).toHaveBeenCalledWith({ admin: "admin123" });
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, { teacherCount: 15 }));
  });

  test("should return 0 when no teachers are found", async () => {
    getTeacherCountService.mockResolvedValueOnce(0);

    await getTeacherCountController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, { teacherCount: 0 }));
  });

  test("should send error response when service call fails", async () => {
    const errorMessage = "Service failure";
    getTeacherCountService.mockRejectedValueOnce(new Error(errorMessage));

    await getTeacherCountController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, errorMessage));
  });
});

describe("attendanceStatusOfSectionController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { sectionId: "section123" },
      body: { startTime: "2025-01-01T00:00:00.000Z", endTime: "2025-01-31T23:59:59.999Z" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should send success response with section attendance", async () => {
    getSectionService.mockResolvedValueOnce({ studentCount: 30 });
    getSectionAttendanceStatusService.mockResolvedValueOnce([{ present: 25, absent: 5 }]);

    await attendanceStatusOfSectionController(req, res);

    expect(getSectionService).toHaveBeenCalledWith({ _id: "section123" });
    expect(getSectionAttendanceStatusService).toHaveBeenCalledWith({
      date: { $gte: "2025-01-01T00:00:00.000Z", $lte: "2025-01-31T23:59:59.999Z" },
      section: "section123",
    });
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, { section: "section123", totalStudent: 30, sectionAttendance: [{ present: 25, absent: 5 }] }));
  });

  test("should return 404 when section is not found", async () => {
    getSectionService.mockResolvedValueOnce(null);

    await attendanceStatusOfSectionController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(error(404, "Section not found"));
  });

  test("should send error response when service call fails", async () => {
    const errorMessage = "Service failure";
    getSectionService.mockRejectedValueOnce(new Error(errorMessage));

    await attendanceStatusOfSectionController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, errorMessage));
  });
});

describe("attendanceStatusController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { startTime: "2025-01-01T00:00:00.000Z", endTime: "2025-01-31T23:59:59.999Z" },
      adminId: "admin123",
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should send success response with attendance data", async () => {
    getSectionAttendancesPipelineService.mockResolvedValueOnce([
      { date: 1704067200000, presentCount: 25, absentCount: 5 },
    ]);
    getStudentCountService.mockResolvedValueOnce(100);

    await attendanceStatusController(req, res);

    expect(getSectionAttendancesPipelineService).toHaveBeenCalled();
    expect(getStudentCountService).toHaveBeenCalledWith({ admin: "admin123", isActive: true });
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, { totalStudents: 100, attendances: [{ date: 1704067200000, presentCount: 25, absentCount: 5 }] }));
  });

  test("should return 0 attendances when no data is found", async () => {
    getSectionAttendancesPipelineService.mockResolvedValueOnce([]);
    getStudentCountService.mockResolvedValueOnce(100);

    await attendanceStatusController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, { totalStudents: 100, attendances: [] }));
  });

  test("should send error response when service call fails", async () => {
    const errorMessage = "Service failure";
    getSectionAttendancesPipelineService.mockRejectedValueOnce(new Error(errorMessage));

    await attendanceStatusController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, errorMessage));
  });
});
