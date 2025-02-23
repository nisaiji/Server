import { registerHolidayController, getHolidaysController, deleteHolidayController, updateHolidayController  } from "../../src/controllers/holiday.controller.js";
import { getHolidayService, getHolidaysService, createHolidayService, updateHolidayService, deleteHolidayService  } from "../../src/services/holiday.service.js";
import { getDayNameService, getStartAndEndTimeService } from "../../src/services/celender.service.js";
import { error, success } from "../../src/utills/responseWrapper.js";
import { StatusCodes } from "http-status-codes";

jest.mock("../../src/services/holiday.service.js", () => ({
  getHolidayService: jest.fn(),
  createHolidayService: jest.fn(),
  getHolidaysService: jest.fn(),
  updateHolidayService: jest.fn(),
  deleteHolidayService: jest.fn()
}));

jest.mock("../../src/services/celender.service.js", () => ({
  getDayNameService: jest.fn(),
  getStartAndEndTimeService: jest.fn(),
}));

jest.mock("../../src/utills/responseWrapper.js", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe("registerHolidayController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        title: "New Year",
        description: "New Year Celebration",
        date: "2025-01-01"
      },
      adminId: "admin123",
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("should successfully register a holiday", async () => {
    const mockDate = new Date("2025-01-01").getTime();
    const mockDay = "Wednesday";
    const mockStartTime = new Date("2025-01-01T00:00:00Z").getTime();
    const mockEndTime = new Date("2025-01-01T23:59:59Z").getTime();

    getDayNameService.mockReturnValue(mockDay);
    getStartAndEndTimeService.mockReturnValue({ startTime: mockStartTime, endTime: mockEndTime });
    getHolidayService.mockResolvedValueOnce(null);
    success.mockReturnValue({ status: 200, message: "Holiday created successfully" });

    await registerHolidayController(req, res);

    expect(getDayNameService).toHaveBeenCalledWith(new Date("2025-01-01").getDay());
    expect(getStartAndEndTimeService).toHaveBeenCalledWith(new Date("2025-01-01"), new Date("2025-01-01"));
    expect(getHolidayService).toHaveBeenCalledWith({ 
      admin: "admin123", 
      date: { $gte: mockStartTime, $lte: mockEndTime } 
    });

    expect(createHolidayService).toHaveBeenCalledWith({
      date: mockDate,
      day: mockDay,
      title: "New Year",
      description: "New Year Celebration",
      admin: "admin123"
    });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, "Holiday created sucessfully"));
  });

  test("should return 409 if holiday already exists", async () => {
    const mockDate = new Date("2025-01-01").getTime();
    const mockStartTime = new Date("2025-01-01T00:00:00Z").getTime();
    const mockEndTime = new Date("2025-01-01T23:59:59Z").getTime();
    const existingHoliday = { _id: "holiday1", title: "New Year" };

    getStartAndEndTimeService.mockReturnValue({ startTime: mockStartTime, endTime: mockEndTime });
    getHolidayService.mockResolvedValueOnce(existingHoliday);
    error.mockReturnValue({ status: 409, message: "Holiday event already exists" });

    await registerHolidayController(req, res);

    expect(getHolidayService).toHaveBeenCalledWith({ 
      admin: "admin123", 
      date: { $gte: mockStartTime, $lte: mockEndTime } 
    });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(res.send).toHaveBeenCalledWith(error(409, "Holiday event already exists"));
  });

  test("should return 500 on internal server error", async () => {
    getHolidayService.mockRejectedValueOnce(new Error("Database Error"));
    error.mockReturnValue({ status: 500, message: "Database Error" });

    await registerHolidayController(req, res);

    expect(getHolidayService).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith(error(500, "Database Error"));
  });
});

describe("getHolidaysController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        startTime: new Date("2025-01-01").getTime(),
        endTime: new Date("2025-12-31").getTime(),
      },
      adminId: "admin123",
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("should successfully return holidays within the given timeframe", async () => {
    const mockHolidays = [
      { _id: "1", title: "New Year", date: new Date("2025-01-01").getTime() },
      { _id: "2", title: "Christmas", date: new Date("2025-12-25").getTime() },
    ];

    getHolidaysService.mockResolvedValueOnce(mockHolidays);
    success.mockReturnValue({ status: 200, data: mockHolidays });

    await getHolidaysController(req, res);

    expect(getHolidaysService).toHaveBeenCalledWith({
      admin: "admin123",
      date: { $gte: req.body.startTime, $lte: req.body.endTime },
    });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, mockHolidays));
  });

  test("should return an empty array if no holidays are found", async () => {
    getHolidaysService.mockResolvedValueOnce([]);
    success.mockReturnValue({ status: 200, data: [] });

    await getHolidaysController(req, res);

    expect(getHolidaysService).toHaveBeenCalledWith({
      admin: "admin123",
      date: { $gte: req.body.startTime, $lte: req.body.endTime },
    });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, []));
  });

  test("should return 500 on internal server error", async () => {
    getHolidaysService.mockRejectedValueOnce(new Error("Database Error"));
    error.mockReturnValue({ status: 500, message: "Database Error" });

    await getHolidaysController(req, res);

    expect(getHolidaysService).toHaveBeenCalledWith({
      admin: "admin123",
      date: { $gte: req.body.startTime, $lte: req.body.endTime },
    });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, "Database Error"));
  });
});

describe("updateHolidayController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { eventId: "holiday123" },
      body: { title: "Updated Title", description: "Updated Description" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("should successfully update the holiday details", async () => {
    const mockHoliday = { _id: "holiday123", title: "Old Title", description: "Old Description" };

    getHolidayService.mockResolvedValueOnce(mockHoliday);
    success.mockReturnValue({ status: 200, message: "Holiday updated successfully" });

    await updateHolidayController(req, res);

    expect(getHolidayService).toHaveBeenCalledWith({ _id: "holiday123" });

    expect(updateHolidayService).toHaveBeenCalledWith(
      { _id: "holiday123" },
      { title: "Updated Title", description: "Updated Description" }
    );

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, "Holiday updated successfully"));
  });

  test("should return 400 if holiday does not exist", async () => {
    getHolidayService.mockResolvedValueOnce(null);
    error.mockReturnValue({ status: 400, message: "holiday not found." });

    await updateHolidayController(req, res);

    expect(getHolidayService).toHaveBeenCalledWith({ _id: "holiday123" });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(error(400, "holiday not found."));
  });

  test("should return 500 on internal server error", async () => {
    getHolidayService.mockRejectedValueOnce(new Error("Database Error"));
    error.mockReturnValue({ status: 500, message: "Database Error" });

    await updateHolidayController(req, res);

    expect(getHolidayService).toHaveBeenCalledWith({ _id: "holiday123" });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, "Database Error"));
  });
});

describe("deleteHolidayController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { eventId: "holiday123" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("should successfully delete a holiday", async () => {
    const mockHoliday = { _id: "holiday123", title: "Holiday Name" };

    getHolidayService.mockResolvedValueOnce(mockHoliday);
    success.mockReturnValue({ status: 200, message: "Holiday deleted successfully" });

    await deleteHolidayController(req, res);

    expect(getHolidayService).toHaveBeenCalledWith({ _id: "holiday123" });
    expect(deleteHolidayService).toHaveBeenCalledWith({ _id: "holiday123" });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, "Holiday deleted successfully"));
  });

  test("should return 400 if the holiday does not exist", async () => {
    getHolidayService.mockResolvedValueOnce(null);
    error.mockReturnValue({ status: 400, message: "Holiday doesn't exists" });

    await deleteHolidayController(req, res);

    expect(getHolidayService).toHaveBeenCalledWith({ _id: "holiday123" });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(error(400, "Holiday doesn't exists"));
  });

  test("should return 500 on internal server error", async () => {
    getHolidayService.mockRejectedValueOnce(new Error("Database Error"));
    error.mockReturnValue({ status: 500, message: "Database Error" });

    await deleteHolidayController(req, res);

    expect(getHolidayService).toHaveBeenCalledWith({ _id: "holiday123" });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, "Database Error"));
  });
});
