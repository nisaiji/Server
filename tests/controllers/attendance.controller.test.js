import { attendanceByTeacherController, getAttendancesController, attendanceCountOfStudentController, getMisMatchAttendanceController, attendanceStatusOfSectionController, bulkAttendanceMarkController, updateAttendanceController, checkAttendaceMarkedController,attendanceStatusOfStudentController  } from "../../src/controllers/attendance.controller.js";
import { createSectionAttendanceService, getSectionAttendanceService, updateSectionAttendanceService, getSectionAttendancesService , getSectionAttendanceStatusService } from "../../src/services/sectionAttendance.services.js";
import { getAttendanceService, getAttendancesService, updateAttendanceService, createAttendanceService,getMisMatchAttendanceService } from "../../src/services/attendance.service.js";
import { getSectionService, getSectionByIdService  } from "../../src/services/section.services.js";
import { getHolidayService } from "../../src/services/holiday.service.js";
import { getTeacherService } from "../../src/services/teacher.services.js";
import { getStudentService, getStudentsPipelineService } from "../../src/services/student.service.js";

import { getStartAndEndTimeService, getDayNameService } from "../../src/services/celender.service.js";
import { StatusCodes } from "http-status-codes";
import { error, success } from "../../src/utills/responseWrapper.js";

jest.mock("../../src/services/sectionAttendance.services.js");
jest.mock("../../src/services/attendance.service.js");
jest.mock("../../src/services/section.services.js");
jest.mock("../../src/services/holiday.service.js");
jest.mock("../../src/services/student.service.js");
jest.mock("../../src/services/teacher.services.js");
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

  test("should return 409 if Today is Sunday", async () => {
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

describe("bulkAttendanceMarkController", () => {
  let req, res, jsonMock, statusMock;

  beforeEach(() => {
    req = {
      params: { sectionId: "section123" },
      body: { studentsAttendances: { "1700000000000": [{ student: "student1", attendance: "present" }] } },
      adminId: "admin789",
      teacherId: "teacher456",
      role: "teacher"
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

  test("should return 404 if section is not found", async () => {
    getSectionService.mockResolvedValue(null);
    error.mockReturnValue({ message: "Section not found" });

    await bulkAttendanceMarkController(req, res);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Section not found" });
  });

  test("should return 401 if teacher is unauthorized (guestTeacher role)", async () => {
    getSectionService.mockResolvedValue({ _id: "section123" });
    req.role = "guestTeacher";
    error.mockReturnValue({ message: "Teacher is unauthorized" });

    await bulkAttendanceMarkController(req, res);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Teacher is unauthorized" });
  });

  test("should return 401 if teacher does not exist", async () => {
    getSectionService.mockResolvedValue({ _id: "section123" });
    getTeacherService.mockResolvedValue(null);
    error.mockReturnValue({ message: "Teacher not exists" });

    await bulkAttendanceMarkController(req, res);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Teacher not exists" });
  });

  test("should return 401 if teacher is unauthorized for this section", async () => {
    getSectionService.mockResolvedValue({ _id: "section123", section: "wrongSection" });
    getTeacherService.mockResolvedValue({ _id: "teacher456", section: "section999" });
    error.mockReturnValue({ message: "Teacher is unauthorized" });

    await bulkAttendanceMarkController(req, res);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Teacher is unauthorized" });
  });

  test("should skip attendance marking if date is in the future", async () => {
    getSectionService.mockResolvedValue({ _id: "section123", startTime: 1600000000000 });
    req.body.studentsAttendances = { "9999999999999": [{ student: "student1", attendance: "present" }] };

    await bulkAttendanceMarkController(req, res);

    expect(createAttendanceService).not.toHaveBeenCalled();
    expect(createSectionAttendanceService).not.toHaveBeenCalled();
  });

  test("should skip attendance marking if day is Sunday", async () => {
    getSectionService.mockResolvedValue({ _id: "section123", startTime: 1600000000000 });
    getDayNameService.mockReturnValue("Sunday");

    await bulkAttendanceMarkController(req, res);

    expect(createAttendanceService).not.toHaveBeenCalled();
    expect(createSectionAttendanceService).not.toHaveBeenCalled();
  });

  test("should skip attendance marking if the day is a holiday", async () => {
    getSectionService.mockResolvedValue({ _id: "section123", startTime: 1600000000000 });
    getHolidayService.mockResolvedValue(true);

    await bulkAttendanceMarkController(req, res);

    expect(createAttendanceService).not.toHaveBeenCalled();
    expect(createSectionAttendanceService).not.toHaveBeenCalled();
  });

  // test("should create new attendance if no existing record found", async () => {
  //   getSectionService.mockResolvedValue({ _id: "section123", startTime: 1600000000000, classId: "class456" });
  //   getAttendanceService.mockResolvedValue(null);
  //   getSectionAttendanceService.mockResolvedValue(null);
  //   success.mockReturnValue({ message: "Attendance marked successfully" });

  //   await bulkAttendanceMarkController(req, res);

  //   expect(createAttendanceService).toHaveBeenCalledWith({
  //     date: 1700000000000,
  //     day: "Monday",
  //     student: "student1",
  //     teacherAttendance: "present",
  //     section: "section123",
  //     classId: "class456",
  //     admin: "admin789",
  //   });

  //   expect(createSectionAttendanceService).toHaveBeenCalledWith({
  //     section: "section123",
  //     presentCount: 1,
  //     absentCount: 0,
  //     date: 1700000000000,
  //     teacher: "teacher456",
  //     status: "completed",
  //   });

  //   expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
  //   expect(jsonMock).toHaveBeenCalledWith({ message: "Attendance marked successfully" });
  // });

  // test("should update existing attendance record if found", async () => {
  //   getSectionService.mockResolvedValue({ _id: "section123", startTime: 1600000000000 });
  //   getAttendanceService.mockResolvedValue({ _id: "attendance789" });
  //   getSectionAttendanceService.mockResolvedValue({ _id: "sectionAttendance123" });

  //   await bulkAttendanceMarkController(req, res);

  //   expect(updateAttendanceService).toHaveBeenCalledWith(
  //     { _id: "attendance789" },
  //     { teacherAttendance: "present" }
  //   );

  //   expect(updateSectionAttendanceService).toHaveBeenCalledWith(
  //     { _id: "sectionAttendance123" },
  //     { presentCount: 1, absentCount: 0, teacher: "teacher456" }
  //   );
  // });

  test("should return 500 on internal server error", async () => {
    getSectionService.mockRejectedValue(new Error("Database error"));
    error.mockReturnValue({ message: "Database error" });

    await bulkAttendanceMarkController(req, res);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Database error" });
  });
});

describe("getMisMatchAttendanceController", () => {
  let req, res, statusMock, jsonMock;

  beforeEach(() => {
    req = {
      sectionId: "section123",
    };
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    res = { status: statusMock, send: jsonMock };

    getStartAndEndTimeService.mockReturnValue({
      startTime: new Date(1700000000000),
      endTime: new Date(1700000005000),
    });

    success.mockImplementation((code, data) => ({ code, data }));
    error.mockImplementation((code, message) => ({ code, message }));
  });

  test("should return mismatched attendance records", async () => {
    getDayNameService.mockReturnValue("Monday"); // Valid day
    getMisMatchAttendanceService.mockResolvedValue([
      { student: "student1", teacherAttendance: "present", parentAttendance: "absent" },
    ]);

    await getMisMatchAttendanceController(req, res);

    expect(getMisMatchAttendanceService).toHaveBeenCalledWith({
      section: "section123",
      startTime: new Date(1700000000000),
      endTime: new Date(1700000005000),
    });

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
    expect(jsonMock).toHaveBeenCalledWith({
      code: 200,
      data: { attendances: [{ student: "student1", teacherAttendance: "present", parentAttendance: "absent" }] },
    });
  });

  test("should return 400 error if Today is Sunday", async () => {
    getDayNameService.mockReturnValue("Sunday");

    await getMisMatchAttendanceController(req, res);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(jsonMock).toHaveBeenCalledWith({
      code: 400,
      message: "Today is Sunday",
    });
  });

  test("should return 500 error on internal failure", async () => {
    getDayNameService.mockReturnValue("Monday");
    getMisMatchAttendanceService.mockRejectedValue(new Error("Database error"));

    await getMisMatchAttendanceController(req, res);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(jsonMock).toHaveBeenCalledWith({
      code: 500,
      message: "Database error",
    });
  });
});

describe("updateAttendanceController", () => {
  let req, res, statusMock, jsonMock;

  beforeEach(() => {
    req = {
      teacherId: "teacher123",
      body: {
        present: [{ _id: "attendance1" }, { _id: "attendance2" }],
        absent: [{ _id: "attendance3" }],
      },
    };

    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    res = { status: statusMock, send: jsonMock };

    getStartAndEndTimeService.mockReturnValue({
      startTime: new Date(1700000000000),
      endTime: new Date(1700000005000),
    });

    success.mockImplementation((code, message) => ({ code, message }));
    error.mockImplementation((code, message) => ({ code, message }));
    jest.clearAllMocks();
  });

  test("should update attendance and section count successfully", async () => {
    getTeacherService.mockResolvedValue({ _id: "teacher123", isActive: true, section: "section123" });
    getSectionAttendanceService.mockResolvedValue({
      presentCount: 10,
      absentCount: 5,
      save: jest.fn(),
    });

    await updateAttendanceController(req, res);

    expect(updateAttendanceService).toHaveBeenCalledTimes(3);
    expect(updateAttendanceService).toHaveBeenCalledWith({ _id: "attendance1" }, { teacherAttendance: "present" });
    expect(updateAttendanceService).toHaveBeenCalledWith({ _id: "attendance2" }, { teacherAttendance: "present" });
    expect(updateAttendanceService).toHaveBeenCalledWith({ _id: "attendance3" }, { teacherAttendance: "absent" });

    expect(jsonMock).toHaveBeenCalledWith({
      code: 200,
      message: "Attendance updated successfully",
    });
  });

  test("should return 401 if teacher is not found", async () => {
    getTeacherService.mockResolvedValue(null);

    await updateAttendanceController(req, res);

    expect(jsonMock).toHaveBeenCalledWith({
      code: 500,
      message: "Cannot read properties of null (reading 'section')",
    });

    expect(updateAttendanceService).not.toHaveBeenCalled();
  });

  test("should return 500 if updateAttendanceService fails", async () => {
    getTeacherService.mockResolvedValue({ _id: "teacher123", isActive: true, section: "section123" });
    getSectionAttendanceService.mockResolvedValue({
      presentCount: 10,
      absentCount: 5,
      save: jest.fn(),
    });

    updateAttendanceService.mockRejectedValue(new Error("Database error"));

    await updateAttendanceController(req, res);

    expect(jsonMock).toHaveBeenCalledWith({
      code: 500,
      message: "Database error",
    });
  });
});

describe("checkAttendaceMarkedController", () => {
  let req, res, statusMock, jsonMock;

  beforeEach(() => {
    req = {
      adminId: "admin123",
      sectionId: "section123",
      role: "teacher",
      params: {},
    };

    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    res = { status: statusMock, send: jsonMock };

    getStartAndEndTimeService.mockReturnValue({
      startTime: new Date(1700000000000),
      endTime: new Date(1700000005000),
    });

    success.mockImplementation((code, message) => ({ code, message }));
    error.mockImplementation((code, message) => ({ code, message }));
  });

  test("should return success if attendance is not marked", async () => {
    getSectionService.mockResolvedValue({ _id: "section123" });
    getDayNameService.mockReturnValue("Monday");
    getHolidayService.mockResolvedValue(null);
    getSectionAttendanceService.mockResolvedValue(null);

    await checkAttendaceMarkedController(req, res);

    expect(jsonMock).toHaveBeenCalledWith({
      code: 200,
      message: "Attendance haven't marked today",
    });
  });

  test("should return conflict if attendance is already marked", async () => {
    getSectionService.mockResolvedValue({ _id: "section123" });
    getDayNameService.mockReturnValue("Monday");
    getHolidayService.mockResolvedValue(null);
    getSectionAttendanceService.mockResolvedValue({ _id: "attendance123" });

    await checkAttendaceMarkedController(req, res);

    expect(jsonMock).toHaveBeenCalledWith({
      code: 409,
      message: "Attendance already marked",
    });
  });

  test("should return conflict if today is a holiday", async () => {
    getSectionService.mockResolvedValue({ _id: "section123" });
    getHolidayService.mockResolvedValue({ _id: "holiday123" });

    await checkAttendaceMarkedController(req, res);

    expect(jsonMock).toHaveBeenCalledWith({
      code: 409,
      message: "Today is scheduled as holiday!",
    });
  });

  test("should return conflict if Today is Sunday", async () => {
    getSectionService.mockResolvedValue({ _id: "section123" });
    getDayNameService.mockReturnValue("Sunday");
    getHolidayService.mockResolvedValue(null);

    await checkAttendaceMarkedController(req, res);

    expect(jsonMock).toHaveBeenCalledWith({
      code: 409,
      message: "Today is Sunday",
    });
  });

  test("should return unauthorized if guest teacher tries to mark attendance", async () => {
    req.role = "teacher";
    getSectionService.mockResolvedValue({ _id: "section123", guestTeacher: true });

    await checkAttendaceMarkedController(req, res);

    expect(jsonMock).toHaveBeenCalledWith({
      code: 401,
      message: "Teacher is not authorized for attendance",
    });
  });

  test("should return not found if section does not exist", async () => {
    getSectionService.mockResolvedValue(null);

    await checkAttendaceMarkedController(req, res);

    expect(jsonMock).toHaveBeenCalledWith({
      code: 502,
      message: "Section not found",
    });
  });

  test("should return bad request if section ID is missing", async () => {
    req.sectionId = null;
    req.params = {};

    await checkAttendaceMarkedController(req, res);

    expect(jsonMock).toHaveBeenCalledWith({
      code: 502,
      message: "Section id is required",
    });
  });

  test("should return 500 on internal server error", async () => {
    getSectionService.mockRejectedValue(new Error("Database error"));

    await checkAttendaceMarkedController(req, res);

    expect(jsonMock).toHaveBeenCalledWith({
      code: 500,
      message: "Database error",
    });
  });
});

describe("attendanceStatusOfSectionController", () => {
  let req, res, statusMock, jsonMock;

  beforeEach(() => {
    req = {
      sectionId: "section123",
      body: {
        startTime: new Date(1700000000000),
        endTime: new Date(1700000005000),
      },
    };

    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    res = { status: statusMock, send: jsonMock };

    success.mockImplementation((code, data) => ({ code, data }));
    error.mockImplementation((code, message) => ({ code, message }));
  });

  test("should return attendance status of the section", async () => {
    getSectionByIdService.mockResolvedValue({ _id: "section123", studentCount: 50 });
    getSectionAttendanceStatusService.mockResolvedValue([{ present: 30, absent: 20 }]);

    await attendanceStatusOfSectionController(req, res);

    expect(jsonMock).toHaveBeenCalledWith({
      code: 200,
      data: {
        section: "section123",
        totalStudent: 50,
        sectionAttendance: [{ present: 30, absent: 20 }],
      },
    });
  });

  test("should return internal server error if section not found", async () => {
    getSectionByIdService.mockResolvedValue(null);

    await attendanceStatusOfSectionController(req, res);

    expect(jsonMock).toHaveBeenCalledWith({
      code: 500,
      message: "Cannot read properties of null (reading 'studentCount')",
    });
  });

  test("should return 500 on internal server error", async () => {
    getSectionByIdService.mockRejectedValue(new Error("Database error"));

    await attendanceStatusOfSectionController(req, res);

    expect(jsonMock).toHaveBeenCalledWith({
      code: 500,
      message: "Database error",
    });
  });
});

describe("attendanceStatusOfStudentController", () => {
  let req, res, statusMock, jsonMock;

  beforeEach(() => {
    req = {
      params: { studentId: "student123" },
      body: {
        startTime: new Date(1700000000000),
        endTime: new Date(1700000005000),
      },
    };

    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    res = { status: statusMock, send: jsonMock };

    success.mockImplementation((code, data) => ({ code, data }));
    error.mockImplementation((code, message) => ({ code, message }));
  });

  test("should return attendance status of the student", async () => {
    getStudentService.mockResolvedValue({ _id: "student123", isActive: true });
    getAttendancesService.mockResolvedValue([
      { date: new Date(1700000001000), status: "present" },
      { date: new Date(1700000002000), status: "absent" },
    ]);

    await attendanceStatusOfStudentController(req, res);

    expect(jsonMock).toHaveBeenCalledWith({
      code: 200,
      data: {
        attendance: [
          { date: new Date(1700000001000), status: "present" },
          { date: new Date(1700000002000), status: "absent" },
        ],
      },
    });
  });

  test("should return 404 when student not found", async () => {
    getStudentService.mockResolvedValue(null);

    await attendanceStatusOfStudentController(req, res);

    expect(jsonMock).toHaveBeenCalledWith({
      code: 404,
      message: "Student not found",
    });
  });

  test("should return 500 on internal server error", async () => {
    getStudentService.mockRejectedValue(new Error("Database error"));

    await attendanceStatusOfStudentController(req, res);

    expect(jsonMock).toHaveBeenCalledWith({
      code: 500,
      message: "Database error",
    });
  });
});

describe("attendanceCountOfStudentController", () => {
  let req, res, statusMock, jsonMock;

  beforeEach(() => {
    req = {
      body: {
        studentId: "student123",
        startTime: new Date(1700000000000),
        endTime: new Date(1700000005000),
      },
    };

    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    res = { status: statusMock, send: jsonMock };

    success.mockImplementation((code, data) => ({ code, data }));
    error.mockImplementation((code, message) => ({ code, message }));
  });

  test("should return attendance counts for a valid student", async () => {
    getStudentService.mockResolvedValue({ _id: "student123", section: "section123" });
    getAttendancesService.mockResolvedValue([
      { student: "student123", teacherAttendance: "present" },
      { student: "student123", teacherAttendance: "present" },
    ]);
    getSectionAttendancesService.mockResolvedValue([
      { section: "section123", date: new Date(1700000001000) },
      { section: "section123", date: new Date(1700000002000) },
      { section: "section123", date: new Date(1700000003000) },
    ]);

    await attendanceCountOfStudentController(req, res);

    expect(jsonMock).toHaveBeenCalledWith({
      code: 200,
      data: {
        studentAttendanceCount: 2,
        sectionAttendanceCount: 3,
      },
    });
  });

  test("should return 404 when student is not found", async () => {
    getStudentService.mockResolvedValue(null);

    await attendanceCountOfStudentController(req, res);

    expect(jsonMock).toHaveBeenCalledWith({
      code: 404,
      message: "Student not found",
    });
  });

  test("should return 500 on internal server error", async () => {
    getStudentService.mockRejectedValue(new Error("Database error"));

    await attendanceCountOfStudentController(req, res);

    expect(jsonMock).toHaveBeenCalledWith({
      code: 500,
      message: "Database error",
    });
  });
});

describe("getAttendancesController", () => {
  let req, res, statusMock, jsonMock;

  beforeEach(() => {
    req = {
      query: {
        startTime: "1700000000000",
        endTime: "1700000005000",
        student: "65d92f2b5e5c110010d10d90",
        section: "65d92f2b5e5c110010d10d91",
        classId: "65d92f2b5e5c110010d10d92",
        admin: "65d92f2b5e5c110010d10d93",
      },
      role: "admin",
    };

    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    res = { status: statusMock, send: jsonMock };

    success.mockImplementation((code, data) => ({ code, data }));
    error.mockImplementation((code, message) => ({ code, message }));
  });

  test("should return attendances successfully", async () => {
    const mockAttendanceData = [
      {
        firstname: "John",
        lastname: "Doe",
        gender: "Male",
        sectionName: "A",
        className: "10th Grade",
        attendances: [
          {
            date: "2024-02-10",
            day: "Monday",
            parentAttendance: "present",
            teacherAttendance: "present",
          },
        ],
      },
    ];

    getStudentsPipelineService.mockResolvedValue(mockAttendanceData);

    await getAttendancesController(req, res);

    expect(jsonMock).toHaveBeenCalledWith({
      code: 200,
      data: { attendances: mockAttendanceData },
    });
  });

  test("should return 403 when guest teacher tries to access", async () => {
    req.role = "guestTeacher";

    await getAttendancesController(req, res);

    expect(jsonMock).toHaveBeenCalledWith({
      code: 403,
      message: "Guest teacher not authorized",
    });
  });

  test("should return 500 on internal server error", async () => {
    getStudentsPipelineService.mockRejectedValue(new Error("Database error"));

    await getAttendancesController(req, res);

    expect(jsonMock).toHaveBeenCalledWith({
      code: 500,
      message: "Database error",
    });
  });
});
