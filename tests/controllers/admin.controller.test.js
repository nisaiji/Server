import { registerAdminController, loginAdminController, updateAdminController, getAdminController } from "../../src/controllers/admin.controller.js";
import { getAccessTokenService, getRefreshTokenService } from "../../src/services/JWTToken.service.js";
import { error, success } from "../../src/utills/responseWrapper.js";
import { getAdminService, registerAdminService, updateAdminService } from "../../src/services/admin.services.js";
import { hashPasswordService, matchPasswordService } from "../../src/services/password.service.js";
import { StatusCodes } from "http-status-codes";

jest.mock("../../src/services/admin.services.js");
jest.mock("../../src/services/JWTToken.service.js");
jest.mock("../../src/services/password.service.js");
jest.mock("../../src/utills/responseWrapper.js");

describe("registerAdminController", () => {
  let req, res, jsonMock, statusMock;

  beforeEach(() => {
    req = {
      body: {
        schoolName: "Test School",
        email: "admin@example.com",
        phone: "1234567890",
        password: "password123"
      }
    };
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ send: jsonMock }));
    res = { status: statusMock };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should register an admin successfully", async () => {
    getAdminService.mockResolvedValue(null);
    hashPasswordService.mockResolvedValue("hashedPassword123");
    registerAdminService.mockResolvedValue({
      _id: "admin123",
      schoolName: "Test School",
      email: "admin@example.com",
      phone: "1234567890",
      isActive: true
    });
    getAccessTokenService.mockResolvedValue("mockAccessToken");
    getRefreshTokenService.mockResolvedValue("mockRefreshToken");
    success.mockReturnValue({ message: "Admin registered successfully" });

    await registerAdminController(req, res);

    expect(getAdminService).toHaveBeenCalledWith({
      $or: [{ email: "admin@example.com" }, { phone: "1234567890" }]
    });
    expect(hashPasswordService).toHaveBeenCalledWith("password123");
    expect(registerAdminService).toHaveBeenCalledWith({
      schoolName: "Test School",
      email: "admin@example.com",
      phone: "1234567890",
      password: "hashedPassword123"
    });
    expect(getAccessTokenService).toHaveBeenCalled();
    expect(getRefreshTokenService).toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(StatusCodes.CREATED);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ message: "Admin registered successfully" }));
  });

  test("should return conflict error when email already exists", async () => {
    getAdminService.mockResolvedValue({ email: "admin@example.com" });
    error.mockReturnValue({ message: "Email already exists" });

    await registerAdminController(req, res);

    expect(getAdminService).toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Email already exists" });
  });

  test("should return conflict error when phone already exists", async () => {
    getAdminService.mockResolvedValue({ phone: "1234567890" });
    error.mockReturnValue({ message: "Phone number already exists" });

    await registerAdminController(req, res);

    expect(getAdminService).toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Phone number already exists" });
  });

  test("should return internal server error on exception", async () => {
    getAdminService.mockRejectedValue(new Error("Database error"));
    error.mockReturnValue({ message: "Database error" });

    await registerAdminController(req, res);

    expect(getAdminService).toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Database error" });
  });
});

describe("loginAdminController", () => {
  let req, res, jsonMock, statusMock;

  beforeEach(() => {
    req = {
      body: {
        email: "admin@example.com",
        password: "password123"
      }
    };
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ send: jsonMock }));
    res = { status: statusMock };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should log in admin successfully", async () => {
    getAdminService.mockResolvedValue({
      _id: "admin123",
      schoolName: "Test School",
      email: "admin@example.com",
      phone: "1234567890",
      password: "hashedPassword",
      isActive: true,
      username: "AdminUser",
      pincode: "123456"
    });
    matchPasswordService.mockResolvedValue(true);
    getAccessTokenService.mockReturnValue("mockAccessToken");
    getRefreshTokenService.mockReturnValue("mockRefreshToken");
    success.mockReturnValue({ message: "Login successful" });

    await loginAdminController(req, res);

    expect(getAdminService).toHaveBeenCalledWith({ email: "admin@example.com" });
    expect(matchPasswordService).toHaveBeenCalledWith({
      enteredPassword: "password123",
      storedPassword: "hashedPassword"
    });
    expect(getAccessTokenService).toHaveBeenCalled();
    expect(getRefreshTokenService).toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ message: "Login successful" }));
  });

  test("should return unauthorized error if email is not found", async () => {
    getAdminService.mockResolvedValue(null);
    error.mockReturnValue({ message: "Unauthorized user" });

    await loginAdminController(req, res);

    expect(getAdminService).toHaveBeenCalledWith({ email: "admin@example.com" });
    expect(statusMock).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Unauthorized user" });
  });

  test("should return unauthorized error if password is incorrect", async () => {
    getAdminService.mockResolvedValue({
      email: "admin@example.com",
      password: "hashedPassword"
    });
    matchPasswordService.mockResolvedValue(false);
    error.mockReturnValue({ message: "Unauthorized user" });

    await loginAdminController(req, res);

    expect(getAdminService).toHaveBeenCalled();
    expect(matchPasswordService).toHaveBeenCalledWith({
      enteredPassword: "password123",
      storedPassword: "hashedPassword"
    });
    expect(statusMock).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Unauthorized user" });
  });

  test("should return internal server error on exception", async () => {
    getAdminService.mockRejectedValue(new Error("Database error"));
    error.mockReturnValue({ message: "Database error" });

    await loginAdminController(req, res);

    expect(getAdminService).toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Database error" });
  });
});

describe("updateAdminController", () => {
  let req, res, jsonMock, statusMock;

  beforeEach(() => {
    req = {
      adminId: "admin123",
      body: {
        schoolName: "Updated School",
        username: "updatedAdmin",
        email: "updated@example.com",
        phone: "1234567890",
        affiliationNo: "AFF123",
        method: "",
        photo: "new_photo_url"
      }
    };
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ send: jsonMock }));
    res = { status: statusMock };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should update admin successfully", async () => {
    getAdminService.mockResolvedValue(null);
    updateAdminService.mockResolvedValue({});
    success.mockReturnValue({ message: "Admin updated successfully" });

    await updateAdminController(req, res);

    expect(getAdminService).toHaveBeenCalledWith({
      $or: [{ username: "updatedAdmin" }, { email: "updated@example.com" }, { phone: "1234567890" }, { affiliationNo: "AFF123" }],
      _id: { $ne: "admin123" }
    });
    expect(updateAdminService).toHaveBeenCalledWith(
      { _id: "admin123" },
      expect.objectContaining({
        schoolName: "Updated School",
        username: "updatedAdmin",
        email: "updated@example.com",
        phone: "1234567890",
        affiliationNo: "AFF123",
        photo: "new_photo_url"
      })
    );
    expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ message: "Admin updated successfully" }));
  });

  test("should return conflict error if username already exists", async () => {
    getAdminService.mockResolvedValue({ username: "updatedAdmin" });
    error.mockReturnValue({ message: "Username already exists." });

    await updateAdminController(req, res);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Username already exists." });
  });

  test("should return conflict error if email already exists", async () => {
    getAdminService.mockResolvedValue({ email: "updated@example.com" });
    error.mockReturnValue({ message: "Email already exists." });

    await updateAdminController(req, res);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Email already exists." });
  });

  test("should return conflict error if phone already exists", async () => {
    getAdminService.mockResolvedValue({ phone: "1234567890" });
    error.mockReturnValue({ message: "Phone already exists." });

    await updateAdminController(req, res);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Phone already exists." });
  });

  test("should return conflict error if affiliation number already exists", async () => {
    getAdminService.mockResolvedValue({ affiliationNo: "AFF123" });
    error.mockReturnValue({ message: "Affiliation No already exists." });

    await updateAdminController(req, res);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Affiliation No already exists." });
  });

  test("should handle photo deletion correctly", async () => {
    req.body.method = "DELETE";
    getAdminService.mockResolvedValue(null);
    updateAdminService.mockResolvedValue({});
    success.mockReturnValue({ message: "Admin updated successfully" });

    await updateAdminController(req, res);

    expect(updateAdminService).toHaveBeenCalledWith(
      { _id: "admin123" },
      expect.objectContaining({ photo: "" })
    );
    expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ message: "Admin updated successfully" }));
  });

  test("should return internal server error on exception", async () => {
    getAdminService.mockRejectedValue(new Error("Database error"));
    error.mockReturnValue({ message: "Database error" });

    await updateAdminController(req, res);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Database error" });
  });
});

describe("getAdminController", () => {
  let req, res, jsonMock, statusMock;

  beforeEach(() => {
    req = { adminId: "admin123" };
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ send: jsonMock }));
    res = { status: statusMock };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return admin details successfully", async () => {
    const adminData = {
      _id: "admin123",
      schoolName: "ABC School",
      email: "admin@example.com",
      phone: "1234567890"
    };
    
    getAdminService.mockResolvedValue(adminData);
    success.mockReturnValue({ data: adminData });

    await getAdminController(req, res);

    expect(getAdminService).toHaveBeenCalledWith({ _id: "admin123" });
    expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
    expect(jsonMock).toHaveBeenCalledWith({ data: adminData });
  });

  test("should return internal server error on exception", async () => {
    getAdminService.mockRejectedValue(new Error("Database error"));
    error.mockReturnValue({ message: "Database error" });

    await getAdminController(req, res);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Database error" });
  });
});
