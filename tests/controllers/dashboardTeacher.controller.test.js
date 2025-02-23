import { error, success } from "../../src/utills/responseWrapper.js";
import { StatusCodes } from "http-status-codes";
import { getSectionAttendanceStatusService } from "../../src/services/sectionAttendance.services.js";
import { getSectionService } from "../../src/services/section.services.js";
import { attendanceStatusOfSectionController  } from "../../src/controllers/dashboardTeacher.controller.js";

jest.mock("../../src/services/section.services.js");
jest.mock("../../src/services/sectionAttendance.services.js");
jest.mock("../../src/utills/responseWrapper.js");

describe("attendanceStatusOfSectionController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      sectionId: "section123",
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

  test("should send success response with section attendance data", async () => {
    getSectionService.mockResolvedValueOnce({ _id: "section123", studentCount: 50 });
    getSectionAttendanceStatusService.mockResolvedValueOnce([
      { date: "2025-01-01", presentCount: 30, absentCount: 20 },
    ]);

    await attendanceStatusOfSectionController(req, res);

    expect(getSectionService).toHaveBeenCalledWith({ _id: "section123" });
    expect(getSectionAttendanceStatusService).toHaveBeenCalledWith({ date: { $gte: "2025-01-01T00:00:00.000Z", $lte: "2025-01-31T23:59:59.999Z" }, section: "section123" });
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, { section: "section123", totalStudent: 50, sectionAttendance: [{ date: "2025-01-01", presentCount: 30, absentCount: 20 }] }));
  });

  test("should return 0 attendance when no data is found", async () => {
    getSectionService.mockResolvedValueOnce({ _id: "section123", studentCount: 50 });
    getSectionAttendanceStatusService.mockResolvedValueOnce([]);

    await attendanceStatusOfSectionController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, { section: "section123", totalStudent: 50, sectionAttendance: [] }));
  });

  test("should send error response when section is not found", async () => {
    getSectionService.mockResolvedValueOnce(null);

    await attendanceStatusOfSectionController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(error(404, "Section not found"));
  });

  test("should send error response when sectionId is missing", async () => {
    req.sectionId = undefined;

    await attendanceStatusOfSectionController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(error(404, "Section Id not found"));
  });

  test("should send error response when service call fails", async () => {
    const errorMessage = "Service failure";
    getSectionService.mockRejectedValueOnce(new Error(errorMessage));

    await attendanceStatusOfSectionController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, errorMessage));
  });
});
