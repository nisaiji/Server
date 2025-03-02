import { registerTeacherController, changePasswordTeacherController, getAllNonSectionTeacherController, loginTeacherController, deleteTeacherController, getAllTeacherOfAdminController, updateTeacherController, getTeacherController } from "../../src/controllers/teacher.controller.js";
import { getTeacherService, updateTeacherService, registerTeacherService, getAllTeacherOfAdminService, getTeachersService  } from "../../src/services/teacher.services.js";
import { getGuestTeacherService } from "../../src/services/guestTeacher.service.js";
import { hashPasswordService } from "../../src/services/password.service.js";
import { matchPasswordService } from "../../src/services/password.service.js";
import { getAdminService } from "../../src/services/admin.services.js";
import { getSectionService } from "../../src/services/section.services.js";
import { getClassService } from "../../src/services/class.sevices.js";
import { getAccessTokenService, getRefreshTokenService } from "../../src/services/JWTToken.service.js";
import { error, success } from "../../src/utills/responseWrapper.js";
import { StatusCodes } from "http-status-codes";
import { convertToMongoId, isValidMongoId } from "../../src/services/mongoose.services.js";

jest.mock("../../src/services/teacher.services.js");
jest.mock("../../src/services/password.service.js");
jest.mock("../../src/services/guestTeacher.service.js");
jest.mock("../../src/services/admin.services.js");
jest.mock("../../src/services/section.services.js");
jest.mock("../../src/services/class.sevices.js");
jest.mock("../../src/services/JWTToken.service.js");
jest.mock("../../src/services/mongoose.services.js")
jest.mock("../../src/utills/responseWrapper.js", () => ({
  error: jest.fn((code, message) => ({ statusCode: code, message })),
  success: jest.fn((code, message) => ({ statusCode: code, message })),
}));

describe("registerTeacherController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      adminId: "admin123",
      body: {
        firstname: "John",
        phone: "1234567890",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it("should return 409 if phone number is already registered", async () => {
    getTeacherService.mockResolvedValue({ _id: "teacher123" });

    await registerTeacherController(req, res);

    expect(getTeacherService).toHaveBeenCalledWith({ phone: "1234567890", isActive: true });
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(res.send).toHaveBeenCalledWith(error(409, "Phone number already registered"));
  });

  it("should register a new teacher successfully", async () => {
    getTeacherService.mockResolvedValue(null);
    hashPasswordService.mockResolvedValue("hashedPassword123");
    registerTeacherService.mockResolvedValue({ _id: "newTeacher123" });

    await registerTeacherController(req, res);

    expect(getTeacherService).toHaveBeenCalledWith({ phone: "1234567890", isActive: true });
    expect(hashPasswordService).toHaveBeenCalledWith("John@1234567890");
    expect(registerTeacherService).toHaveBeenCalledWith({
      firstname: "John",
      phone: "1234567890",
      password: "hashedPassword123",
      admin: "admin123",
    });
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
    expect(res.send).toHaveBeenCalledWith(success(201, "Teacher registered successfully"));
  });

  it("should return 500 if an error occurs", async () => {
    getTeacherService.mockRejectedValue(new Error("Database error"));

    await registerTeacherController(req, res);

    expect(getTeacherService).toHaveBeenCalledWith({ phone: "1234567890", isActive: true });
    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, "Database error"));
  });
});

describe("loginTeacherController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        user: "testUser",
        password: "testPassword",
        platform: "app",
        deviceId: "device123",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it("should return 404 if no teacher or guest teacher is found", async () => {
    getTeacherService.mockResolvedValue(null);
    getGuestTeacherService.mockResolvedValue(null);

    await loginTeacherController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.send).toHaveBeenCalledWith(error(404, "Unauthorized user"));
  });

  it("should return 404 if admin does not exist", async () => {
    getTeacherService.mockResolvedValue({ admin: "admin123" });
    getGuestTeacherService.mockResolvedValue(null);
    getAdminService.mockResolvedValue(null);

    await loginTeacherController(req, res);

    expect(res.send).toHaveBeenCalledWith(error(404, "Admin not exists"));
  });

  it("should return 403 if admin is inactive", async () => {
    getTeacherService.mockResolvedValue({ admin: "admin123" });
    getGuestTeacherService.mockResolvedValue(null);
    getAdminService.mockResolvedValue({ isActive: false });

    await loginTeacherController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    expect(res.send).toHaveBeenCalledWith(error(403, "Services are temporarily paused. Please contact support."));
  });

  it("should return 404 if deviceId is missing for app login", async () => {
    req.body.deviceId = undefined;
    getTeacherService.mockResolvedValue({ admin: "admin123" });
    getGuestTeacherService.mockResolvedValue(null);
    getAdminService.mockResolvedValue({ isActive: true });

    await loginTeacherController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.send).toHaveBeenCalledWith(error(404, "Device Id is required"));
  });

  it("should return 404 if password does not match", async () => {
    getTeacherService.mockResolvedValue({ admin: "admin123", password: "hashedPass" });
    getGuestTeacherService.mockResolvedValue(null);
    getAdminService.mockResolvedValue({ isActive: true });
    matchPasswordService.mockResolvedValue(false);

    await loginTeacherController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.send).toHaveBeenCalledWith(error(404, "Unauthorized  user"));
  });

  it("should return 401 if device mismatch occurs", async () => {
    getTeacherService.mockResolvedValue({ admin: "admin123", section:"sectionId", isLoginAlready: true, deviceId: "wrongDevice" });
    getSectionService.mockResolvedValue({name: 'A'})
    getGuestTeacherService.mockResolvedValue(null);
    getAdminService.mockResolvedValue({ isActive: true });
    matchPasswordService.mockResolvedValue(true);

    await loginTeacherController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.send).toHaveBeenCalledWith(error(401, "Access denied due to device mismatch"));
  });
});

describe('getAllTeacherOfAdminController', () => {
  let req, res;

  beforeEach(() => {
    req = { adminId: 'admin123' };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it('should return all teachers for the given admin', async () => {
    const mockTeachers = [{ id: '1', name: 'John Doe' }, { id: '2', name: 'Jane Doe' }];
    getAllTeacherOfAdminService.mockResolvedValue(mockTeachers);

    await getAllTeacherOfAdminController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, mockTeachers));
  });

  it('should handle internal server errors', async () => {
    const errorMessage = 'Database connection failed';
    getAllTeacherOfAdminService.mockRejectedValue(new Error(errorMessage));

    await getAllTeacherOfAdminController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, errorMessage));
  });
});

describe("updateTeacherController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { teacherId: "validTeacherId" },
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    isValidMongoId.mockReturnValue(true);
  });

  it("should return 400 if teacherId is invalid", async () => {
    isValidMongoId.mockReturnValue(false);
    await updateTeacherController(req, res);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.send).toHaveBeenCalledWith(error(400, "Invalid teacher Id"));
  });

  it("should return 400 if teacher does not exist", async () => {
    getTeacherService.mockResolvedValue(null);
    await updateTeacherController(req, res);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.send).toHaveBeenCalledWith(error(400, "Teacher doesn't exists"));
  });

  it("should return 409 if email is already registered", async () => {
    req.body.email = "test@example.com";
    getTeacherService
      .mockResolvedValueOnce({ _id: "validTeacherId", isActive: true })
      .mockResolvedValueOnce({ _id: "otherId", email: "test@example.com", isActive: true });
    await updateTeacherController(req, res);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(res.send).toHaveBeenCalledWith(error(409, "Email already registered"));
  });

  it("should update teacher successfully", async () => {
    req.body.firstname = "Updated Name";
    getTeacherService.mockResolvedValue({ _id: "validTeacherId", isActive: true });
    updateTeacherService.mockResolvedValue(true);
    await updateTeacherController(req, res);
    expect(updateTeacherService).toHaveBeenCalledWith(
      { _id: "validTeacherId" },
      { firstname: "Updated Name" }
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, "Teacher updated successfully"));
  });

  it("should return 500 if an error occurs", async () => {
    getTeacherService.mockRejectedValue(new Error("Database error"));
    await updateTeacherController(req, res);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, "Database error"));
  });
});

describe("deleteTeacherController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { teacherId: "validTeacherId" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    isValidMongoId.mockReturnValue(true);
  });

  it("should return 400 if teacherId is invalid", async () => {
    isValidMongoId.mockReturnValue(false);
    await deleteTeacherController(req, res);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.send).toHaveBeenCalledWith(error(400, "Invalid Teacher Id"));
  });

  it("should return 404 if teacher does not exist", async () => {
    getTeacherService.mockResolvedValue(null);
    await deleteTeacherController(req, res);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(error(404, "Teacher not found"));
  });

  it("should return 409 if teacher is assigned to a section", async () => {
    getTeacherService.mockResolvedValue({ _id: "validTeacherId", isActive: true, section: "someSection" });
    await deleteTeacherController(req, res);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(res.send).toHaveBeenCalledWith(error(409, "Teacher is assigned to section. Can't delete teacher"));
  });

  it("should delete teacher successfully", async () => {
    getTeacherService.mockResolvedValue({ _id: "validTeacherId", isActive: true });
    updateTeacherService.mockResolvedValue(true);
    await deleteTeacherController(req, res);
    expect(updateTeacherService).toHaveBeenCalledWith(
      { _id: "validTeacherId" },
      { isActive: false }
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, "Teacher deleted successfully"));
  });

  it("should return 500 if an error occurs", async () => {
    getTeacherService.mockRejectedValue(new Error("Database error"));
    await deleteTeacherController(req, res);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, "Database error"));
  });
});

describe("getTeacherController", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, teacherId: null };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it("should return 400 if teacher ID is invalid", async () => {
    req.params.teacherId = "invalidId";
    isValidMongoId.mockReturnValue(false);

    await getTeacherController(req, res);

    expect(isValidMongoId).toHaveBeenCalledWith("invalidId");
    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.send).toHaveBeenCalledWith(error(400, "Invalid teacher Id"));
  });

  it("should return 404 if teacher is not found", async () => {
    req.params.teacherId = "validTeacherId";
    isValidMongoId.mockReturnValue(true);
    getTeacherService.mockResolvedValue(null);

    await getTeacherController(req, res);

    expect(getTeacherService).toHaveBeenCalledWith(
      { _id: "validTeacherId", isActive: true },
      { password: 0 }
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(success(404, "Teacher not found"));
  });

  it("should return teacher data along with section details", async () => {
    req.params.teacherId = "validTeacherId";
    isValidMongoId.mockReturnValue(true);
    
    const teacherMock = { _id: "validTeacherId", name: "John Doe", section: "sectionId" };
    const sectionMock = {  className: "Math", grade: "10th" };

    getTeacherService.mockResolvedValue(teacherMock);
    getSectionService.mockResolvedValue(sectionMock);

    await getTeacherController(req, res);

    expect(getTeacherService).toHaveBeenCalledWith(
      { _id: "validTeacherId", isActive: true },
      { password: 0 }
    );
    expect(getSectionService).toHaveBeenCalledWith(
      { _id: "sectionId" },
      { _id: 0, teacher: 0 }
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, { ...teacherMock._doc, ...sectionMock._doc }));
  });

  it("should handle missing section data gracefully", async () => {
    req.params.teacherId = "validTeacherId";
    isValidMongoId.mockReturnValue(true);
    
    const teacherMock = { _id: "validTeacherId", name: "John Doe", section: "sectionId" };

    getTeacherService.mockResolvedValue(teacherMock);

    await getTeacherController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, { ...teacherMock._doc }));
  });

  it("should return 500 on unexpected errors", async () => {
    req.params.teacherId = "validTeacherId";
    isValidMongoId.mockReturnValue(true);
    getTeacherService.mockRejectedValue(new Error("Database error"));

    await getTeacherController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, "Database error"));
  });
});

describe("getAllNonSectionTeacherController", () => {
  let req, res;

  beforeEach(() => {
    req = { adminId: "validAdminId" };
    res = {
      send: jest.fn(),
    };
  });

  it("should return all teachers without sections", async () => {
    const teachersMock = [
      { _id: "teacher1", name: "John Doe", section: null },
      { _id: "teacher2", name: "Jane Doe", section: null },
    ];

    getTeachersService.mockResolvedValue(teachersMock);

    await getAllNonSectionTeacherController(req, res);

    expect(getTeachersService).toHaveBeenCalledWith({
      admin: "validAdminId",
      section: null,
      isActive: true,
    });
    expect(res.send).toHaveBeenCalledWith(success(200, teachersMock));
  });

  it("should return an empty array if no teachers are found", async () => {
    getTeachersService.mockResolvedValue([]);

    await getAllNonSectionTeacherController(req, res);

    expect(res.send).toHaveBeenCalledWith(success(200, []));
  });

  it("should handle errors properly", async () => {
    const errorMessage = "Internal Server Error";
    getTeachersService.mockRejectedValue(new Error(errorMessage));

    await getAllNonSectionTeacherController(req, res);

    expect(res.send).toHaveBeenCalledWith(error(500, errorMessage));
  });
});

describe("changePasswordTeacherController", () => {
  let req, res, teacherMock;

  beforeEach(() => {
    req = {
      teacherId: "validTeacherId",
      body: {
        oldPassword: "oldPass123",
        newPassword: "newPass456",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    teacherMock = {
      _id: "validTeacherId",
      password: "oldPass123",
      save: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should successfully change the password", async () => {
    getTeacherService.mockResolvedValue(teacherMock);
    matchPasswordService.mockResolvedValue(true);
    hashPasswordService.mockResolvedValue("hashedNewPassword");

    await changePasswordTeacherController(req, res);

    expect(getTeacherService).toHaveBeenCalledWith({ _id: "validTeacherId", isActive: true });
    expect(matchPasswordService).toHaveBeenCalledWith({
      enteredPassword: "oldPass123",
      storedPassword: "oldPass123",
    });
    expect(hashPasswordService).toHaveBeenCalledWith("newPass456");
    expect(teacherMock.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, "Password updated successfully"));
  });

  it("should return 401 if teacher is not found", async () => {
    getTeacherService.mockResolvedValue(null);

    await changePasswordTeacherController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.send).toHaveBeenCalledWith(error(401, "Unauthorized user"));
  });

  it("should return 404 if old password is incorrect", async () => {
    getTeacherService.mockResolvedValue(teacherMock);
    matchPasswordService.mockResolvedValue(false);

    await changePasswordTeacherController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.send).toHaveBeenCalledWith(error(404, "Wrong password"));
  });

  it("should handle internal server errors", async () => {
    getTeacherService.mockRejectedValue(new Error("Internal Server Error"));

    await changePasswordTeacherController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, "Internal Server Error"));
  });
});
