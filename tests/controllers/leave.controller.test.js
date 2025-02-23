import { StatusCodes } from "http-status-codes";
import { registerLeaveRequestController, getLeaveRequestsController, updateTeacherLeavRequestController } from "../../src/controllers/leave.controller.js";
import { getLeaveRequestsPipelineService, registerLeaveRequestService, getLeaveRequestsCountService, updateLeaveRequestService, getLeaveRequestService } from "../../src/services/leave.service.js";
import { getSectionService } from "../../src/services/section.services.js";
import { success, error } from "../../src/utills/responseWrapper.js";
import { getFormattedDateService } from "../../src/services/celender.service.js";
import { getTeacherService, updateTeacherService } from "../../src/services/teacher.services.js";
import { getGuestTeacherService, registerGuestTeacherService } from "../../src/services/guestTeacher.service.js";
import { hashPasswordService } from "../../src/services/password.service.js";

jest.mock("../../src/services/student.service.js");
jest.mock("../../src/services/leave.service.js");
jest.mock("../../src/services/mongoose.services.js");
jest.mock("../../src/services/celender.service.js");
jest.mock("../../src/services/section.services.js");
jest.mock("../../src/services/password.service.js", () => ({
  hashPasswordService: jest.fn()
}));
jest.mock("../../src/services/guestTeacher.service.js", () => ({
  getGuestTeacherService: jest.fn(),
  registerGuestTeacherService: jest.fn()
}));
jest.mock("../../src/services/teacher.services.js", () => ({
  getTeacherService: jest.fn(),
  updateTeacherService: jest.fn()
}));

describe("registerLeaveRequestController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { reason: "Sick Leave", description: "Flu symptoms", startTime: "2025-03-01", endTime: "2025-03-03" },
      teacherId: "teacher123",
      adminId: "admin456",
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should send success response when leave request is registered", async () => {
    getLeaveRequestsPipelineService.mockResolvedValueOnce([]);
    registerLeaveRequestService.mockResolvedValueOnce();

    await registerLeaveRequestController(req, res);

    expect(registerLeaveRequestService).toHaveBeenCalledWith({
      reason: "Sick Leave",
      description: "Flu symptoms",
      sender: { id: "teacher123", model: "teacher" },
      receiver: { id: "admin456", model: "admin" },
      startTime: "2025-03-01",
      endTime: "2025-03-03",
    });
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, "Request sent successfully"));
  });

  test("should return conflict if leave request already exists", async () => {
    getLeaveRequestsPipelineService.mockResolvedValueOnce([{ startTime: "2025-03-01", endTime: "2025-03-03" }]);
    getFormattedDateService.mockReturnValueOnce("March 1, 2025").mockReturnValueOnce("March 3, 2025");

    await registerLeaveRequestController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(res.send).toHaveBeenCalledWith(error(409, "Already applied for leave from March 1, 2025 to March 3, 2025."));
  });

  test("should send error response when service call fails", async () => {
    const errorMessage = "Service failure";
    getLeaveRequestsPipelineService.mockRejectedValueOnce(new Error(errorMessage));

    await registerLeaveRequestController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, errorMessage));
  });
});

describe('getLeaveRequestsController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      adminId: 'admin-id', // Set a mock admin ID
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle when no leave requests are found', async () => {
    const mockLeaveRequests = [];
    const totalLeaveRequests = 0;
    const totalPages = 0;

    getLeaveRequestsPipelineService.mockResolvedValue(mockLeaveRequests);
    getLeaveRequestsCountService.mockResolvedValue(totalLeaveRequests);

    req.query.page = 1;
    req.query.limit = 10;

    await getLeaveRequestsController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith({
      result: {
        leaveRequests: mockLeaveRequests,
        currentPage: 1,
        totalPages: totalPages,
        totalLeaveRequests: totalLeaveRequests,
        pageSize: 10,
      },
      status: 'ok',
      statusCode: StatusCodes.OK,
    });
  });

  it('should handle missing query parameters gracefully', async () => {
    const mockLeaveRequests = [];
    const totalLeaveRequests = 0;
    const totalPages = 0;

    getLeaveRequestsPipelineService.mockResolvedValue(mockLeaveRequests);
    getLeaveRequestsCountService.mockResolvedValue(totalLeaveRequests);

    req.query.page = undefined;
    req.query.limit = undefined;

    await getLeaveRequestsController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith({
      result: {
        leaveRequests: mockLeaveRequests,
        currentPage: 1,
        totalPages: totalPages,
        totalLeaveRequests: totalLeaveRequests,
        pageSize: 10,
      },
      status: 'ok',
      statusCode: StatusCodes.OK,
    });
  });
});
