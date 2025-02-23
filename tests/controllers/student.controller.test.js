import { registerStudentController, registerStudentsFromExcelController, getStudentsController, deleteStudentController, updateStudentController } from "../../src/controllers/student.controller";
import { getSectionService, updateSectionService } from "../../src/services/section.services";
import { getParentService, registerParentService, updateParentService } from "../../src/services/parent.services";
import { getStudentService, getStudentsService, updateStudentService, registerStudentService, getStudentsPipelineService, getStudentCountService} from "../../src/services/student.service";
import { getClassService } from "../../src/services/class.sevices.js";
import { hashPasswordService } from "../../src/services/password.service";
import { calculateDaysBetweenDates, calculateSundays } from "../../src/services/celender.service.js";
import { getHolidayCountService } from "../../src/services/holiday.service.js";
import { convertToMongoId } from "../../src/services/mongoose.services.js";
import { registerStudentsFromExcelHelper } from "../../src/helpers/student.helper";
import { error, success } from "../../src/utills/responseWrapper";
import { StatusCodes } from "http-status-codes";
import fs from "fs/promises";
import xlsx from "xlsx";

jest.mock("../../src/helpers/student.helper");
jest.mock("../../src/services/section.services");
jest.mock("../../src/services/class.sevices");
jest.mock("../../src/services/parent.services");
jest.mock("../../src/services/student.service");
jest.mock("../../src/services/password.service");
jest.mock("../../src/services/class.sevices.js");
jest.mock("../../src/services/holiday.service.js");
jest.mock("../../src/services/mongoose.services.js");
jest.mock("../../src/services/celender.service.js");
jest.mock("fs/promises");
jest.mock("xlsx");

describe("registerStudentController", () => {
  let req, res, sectionMock, classMock, parentMock, studentMock;

  beforeEach(() => {
    req = {
      adminId: "adminId123",
      body: {
        firstname: "John",
        lastname: "Doe",
        gender: "Male",
        parentName: "Jane Doe",
        phone: "9876543210",
        sectionId: "sectionId123",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    sectionMock = { _id: "sectionId123", classId: "classId123", studentCount: 5 };
    classMock = { _id: "classId123" };
    parentMock = { _id: "parentId123", phone: "9876543210" };
    studentMock = null;
  });

  it("should successfully register a new student", async () => {
    getSectionService.mockResolvedValue(sectionMock);
    getClassService.mockResolvedValue(classMock);
    getParentService.mockResolvedValue(null);
    registerParentService.mockResolvedValue(parentMock);
    getStudentService.mockResolvedValue(null);
    hashPasswordService.mockResolvedValue("hashedPassword123");
    registerStudentService.mockResolvedValue({ _id: "studentId123" });
    updateSectionService.mockResolvedValue();

    await registerStudentController(req, res);

    expect(getSectionService).toHaveBeenCalledWith({ _id: "sectionId123" });
    expect(getClassService).toHaveBeenCalledWith({ _id: "classId123" });
    expect(getParentService).toHaveBeenCalledWith({ phone: "9876543210", isActive: true });
    expect(registerParentService).toHaveBeenCalledWith({
      fullname: "Jane Doe",
      phone: "9876543210",
      password: "hashedPassword123",
    });
    expect(getStudentService).toHaveBeenCalledWith({ firstname: "John", parent: "parentId123" });
    expect(registerStudentService).toHaveBeenCalledWith({
      firstname: "John",
      lastname: "Doe",
      gender: "Male",
      parent: "parentId123",
      section: "sectionId123",
      classId: "classId123",
      admin: "adminId123",
    });
    expect(updateSectionService).toHaveBeenCalledWith({ _id: "sectionId123" }, { studentCount: 6 });
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(201, "Student created successfully!"));
  });

  it("should return 404 if section is not found", async () => {
    getSectionService.mockResolvedValue(null);

    await registerStudentController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(error(404, "Section not found"));
  });

  it("should return 404 if class is not found", async () => {
    getSectionService.mockResolvedValue(sectionMock);
    getClassService.mockResolvedValue(null);

    await registerStudentController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(error(404, "Class not found"));
  });

  it("should return 400 if student already exists", async () => {
    getSectionService.mockResolvedValue(sectionMock);
    getClassService.mockResolvedValue(classMock);
    getParentService.mockResolvedValue(parentMock);
    getStudentService.mockResolvedValue({ _id: "studentId123" });

    await registerStudentController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(res.send).toHaveBeenCalledWith(error(400, "Student already exists"));
  });

  it("should handle internal server errors", async () => {
    getSectionService.mockRejectedValue(new Error("Internal Server Error"));

    await registerStudentController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, "Internal Server Error"));
  });
});

describe("deleteStudentController", () => {
  let req, res, studentMock, parentMock, sectionMock;

  beforeEach(() => {
    req = {
      params: { studentId: "validStudentId" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    studentMock = {
      _id: "validStudentId",
      parent: "validParentId",
      section: "validSectionId",
      isActive: true,
    };

    parentMock = {
      _id: "validParentId",
      isActive: true,
    };

    sectionMock = {
      _id: "validSectionId",
      studentCount: 5,
    };

    jest.clearAllMocks();
  });

  it("should successfully delete a student and update section & parent accordingly", async () => {
    getStudentService.mockResolvedValue(studentMock);
    getParentService.mockResolvedValue(parentMock);
    getSectionService.mockResolvedValue(sectionMock);
    getStudentsService.mockResolvedValue([studentMock]);

    await deleteStudentController(req, res);

    expect(getStudentService).toHaveBeenCalledWith({ _id: "validStudentId", isActive: true });
    expect(getParentService).toHaveBeenCalledWith({ _id: "validParentId", isActive: true });
    expect(getSectionService).toHaveBeenCalledWith({ _id: "validSectionId" });

    expect(updateStudentService).toHaveBeenCalledWith({ _id: "validStudentId" }, { isActive: false });
    expect(updateSectionService).toHaveBeenCalledWith({ _id: "validSectionId" }, { studentCount: 4 });

    expect(updateParentService).not.toHaveBeenCalled(); // Parent remains active

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, "Student deleted successfully"));
  });

  it("should return 404 if student does not exist", async () => {
    getStudentService.mockResolvedValue(null);

    await deleteStudentController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(error(404, "Student doesn't exists"));
  });

  it("should return 404 if parent does not exist", async () => {
    getStudentService.mockResolvedValue(studentMock);
    getParentService.mockResolvedValue(null);

    await deleteStudentController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(error(404, "Parent doesn't exists"));
  });

  it("should deactivate parent if no active children remain", async () => {
    getStudentService.mockResolvedValue(studentMock);
    getParentService.mockResolvedValue(parentMock);
    getSectionService.mockResolvedValue(sectionMock);
    getStudentsService.mockResolvedValue([]);

    await deleteStudentController(req, res);

    expect(updateParentService).toHaveBeenCalledWith({ _id: "validParentId" }, { isActive: false });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, "Student deleted successfully"));
  });

  it("should handle errors and return 500", async () => {
    getStudentService.mockRejectedValue(new Error("Database Error"));

    await deleteStudentController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, "Database Error"));
  });
});

describe("updateStudentController", () => {
  let req, res, studentMock, parentMock;

  beforeEach(() => {
    req = {
      params: { studentId: "validStudentId" },
      body: {
        firstname: "UpdatedFirstName",
        lastname: "UpdatedLastName",
        phone: "1234567890",
        parentName: "Updated Parent Name",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    studentMock = {
      _id: "validStudentId",
      parent: "validParentId",
    };

    parentMock = {
      _id: "validParentId",
      phone: "1234567890",
    };

    jest.clearAllMocks();
  });

  // it("should successfully update student and parent", async () => {
  //   getStudentService.mockResolvedValue(studentMock);
  //   getParentService.mockResolvedValue(parentMock);
  //   // getParentService.mockResolvedValueOnce(null); // No conflict for phone
  
  //   updateStudentService.mockResolvedValue();
  //   updateParentService.mockResolvedValue();
  
  //   await updateStudentController(req, res);
  
  //   console.log("updateStudentService Calls:", updateStudentService.mock.calls);
  
  //   expect(getStudentService).toHaveBeenCalledWith({ _id: "validStudentId" });
  //   expect(getParentService).toHaveBeenCalledWith({ _id: "validParentId" });
  
  //   // expect(updateStudentService).toHaveBeenCalledWith(
  //   //   { _id: "validStudentId" },
  //   //   expect.objectContaining({
  //   //     firstname: "UpdatedFirstName",
  //   //     lastname: "UpdatedLastName",
  //   //   })
  //   // );
  
  //   expect(updateParentService).toHaveBeenCalledWith(
  //     { _id: "validParentId" },
  //     expect.objectContaining({
  //       phone: "9876543210",
  //       fullname: "Updated Parent Name",
  //     })
  //   );
  
  //   expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
  //   expect(res.send).toHaveBeenCalledWith(success(200, "Student updated successfully"));
  // });
  

  it("should return 404 if student is not found", async () => {
    getStudentService.mockResolvedValue(null);

    await updateStudentController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(error(404, "Student not found"));
  });

  it("should return 404 if parent is not found", async () => {
    getStudentService.mockResolvedValue(studentMock);
    getParentService.mockResolvedValue(null);

    await updateStudentController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(error(404, "Parent not found"));
  });

  it("should return 409 if phone number is already registered to another active parent", async () => {
    getStudentService.mockResolvedValue(studentMock);
    getParentService.mockResolvedValue(parentMock);
    getParentService.mockResolvedValueOnce({ _id: "anotherParentId", phone: "9876543210" });

    await updateStudentController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(res.send).toHaveBeenCalledWith(error(409, "phone number already registered"));
  });

  it("should handle errors and return 500", async () => {
    getStudentService.mockRejectedValue(new Error("Database Error"));

    await updateStudentController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, "Database Error"));
  });
});

describe("getStudentsController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      adminId: "admin123",
      role: "admin",
      sectionId: "section123",
      parentId: "parent123",
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it("should return 400 if no filter parameters are provided", async () => {
    await getStudentsController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.send).toHaveBeenCalledWith(error(400, "Invalid request"));
  });

  it("should return 403 if admin tries to fetch data for another admin", async () => {
    req.query.admin = "otherAdmin123";

    await getStudentsController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    expect(res.send).toHaveBeenCalledWith(error(403, "Forbidden access"));
  });

  it("should return students data with pagination", async () => {
    req.query.admin = "admin123";
    req.query.page = "1";
    req.query.limit = "10";

    getStudentsPipelineService.mockResolvedValue([{ _id: "student1", firstname: "John" }]);
    getStudentCountService.mockResolvedValue(15);

    await getStudentsController(req, res);

    expect(getStudentsPipelineService).toHaveBeenCalled();
    expect(getStudentCountService).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, {
      students: [{ _id: "student1", firstname: "John" }],
      currentPage: 1,
      totalPages: 2,
      totalStudents: 15,
      pageSize: 10,
    }));
  });

  it("should return 400 if attendance is included without startTime and endTime", async () => {
    req.query.admin = "admin123";
    req.query.include = "attendance";

    await getStudentsController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.send).toHaveBeenCalledWith(error(400, "StartTime and endTime is required."));
  });

  it("should handle internal server errors", async () => {
    req.query.admin = "admin123";
    getStudentsPipelineService.mockRejectedValue(new Error("Database error"));

    await getStudentsController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, "Database error"));
  });
});
