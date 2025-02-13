import { attendanceByTeacherController } from "../../src/controllers/attendance.controller.js";
import { 
  createSectionAttendanceService, getSectionAttendanceService 
} from "../../src/services/sectionAttendance.services.js";
import { 
  createAttendanceService, getAttendanceService, updateAttendanceService 
} from "../../src/services/attendance.service.js";
import { getSectionService } from "../../src/services/section.services.js";
import { getHolidayService } from "../../src/services/holiday.service.js";
import { getStartAndEndTimeService, getDayNameService } from "../../src/services/celender.service.js";
import { StatusCodes } from "http-status-codes";
import { error, success } from "../../src/utills/responseWrapper.js";

jest.mock("../../src/services/sectionAttendance.services.js");
jest.mock("../../src/services/attendance.service.js");
jest.mock("../../src/services/section.services.js");
jest.mock("../../src/services/holiday.service.js");
jest.mock("../../src/services/celender.service.js");
jest.mock("../../src/utills/responseWrapper.js");

describe("attendanceByTeacherController", () => {
  let req, res, jsonMock, statusMock;

  beforeEach(() => {
    req = {
      body: { sectionId: "section123", present: [{ id: "student1" }], absent: [{ id: "student2" }] },
      teacherId: "teacher456",
      adminId: "admin789"
    };
    
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ send: jsonMock }));
    res = { status: statusMock };

    getStartAndEndTimeService.mockReturnValue({ startTime: new Date(), endTime: new Date() });
    getDayNameService.mockReturnValue("Monday");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 404 if section not found", async () => {
    getSectionService.mockResolvedValue(null);
    error.mockReturnValue({ message: "Section not found" });

    await attendanceByTeacherController(req, res);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Section not found" });
  });

  test("should return 401 if teacher is unauthorized", async () => {
    getSectionService.mockResolvedValue({ guestTeacher: "anotherTeacher" });
    error.mockReturnValue({ message: "Teacher is unauthorized" });

    await attendanceByTeacherController(req, res);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Teacher is unauthorized" });
  });

  test("should return 400 if no students are provided", async () => {
    req.body.present = [];
    req.body.absent = [];

    getSectionService.mockResolvedValue({ guestTeacher: req.teacherId });
    error.mockReturnValue({ message: "No student provided" });

    await attendanceByTeacherController(req, res);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalledWith({ message: "No student provided" });
  });

  test("should return 409 if today is Sunday", async () => {
    getSectionService.mockResolvedValue({ guestTeacher: req.teacherId });
    getDayNameService.mockReturnValue("Sunday");
    error.mockReturnValue({ message: "Today is Sunday" });

    await attendanceByTeacherController(req, res);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Today is Sunday" });
  });

  test("should return 409 if today is a holiday", async () => {
    getSectionService.mockResolvedValue({ guestTeacher: req.teacherId });
    getHolidayService.mockResolvedValue(true);
    error.mockReturnValue({ message: "Today is scheduled as holiday!" });

    await attendanceByTeacherController(req, res);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Today is scheduled as holiday!" });
  });

  test("should return 409 if attendance is already marked", async () => {
    getSectionService.mockResolvedValue({ guestTeacher: req.teacherId });
    getSectionAttendanceService.mockResolvedValue(true);
    error.mockReturnValue({ message: "Attendance already marked" });

    await attendanceByTeacherController(req, res);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Attendance already marked" });
  });

  test("should mark attendance successfully", async () => {
    getSectionService.mockResolvedValue({ guestTeacher: req.teacherId, classId: "class123" });
    getSectionAttendanceService.mockResolvedValue(null);
    getHolidayService.mockResolvedValue(null);
    getAttendanceService.mockResolvedValue(null);
    success.mockReturnValue({ message: "Attendance marked successfully" });

    await attendanceByTeacherController(req, res);

    expect(createAttendanceService).toHaveBeenCalledTimes(2); // Once for present, once for absent
    expect(createSectionAttendanceService).toHaveBeenCalledWith({
      date: expect.any(Number),
      section: "section123",
      teacher: "teacher456",
      presentCount: 1,
      absentCount: 1,
      status: "completed"
    });

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Attendance marked successfully" });
  });

  test("should return 500 if an internal server error occurs", async () => {
    getSectionService.mockRejectedValue(new Error("Database error"));
    error.mockReturnValue({ message: "Database error" });

    await attendanceByTeacherController(req, res);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Database error" });
  });
});
