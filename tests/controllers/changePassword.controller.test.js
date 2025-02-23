import { registerChangePasswordRequestController, verifyTeacherForgetPasswordController, changePasswordByVerifiedTeacherController, updateChangePasswordRequestByAdminController, getChangePasswordRequestsController  } from "../../src/controllers/changePassword.controller.js";
import { getChangePasswordRequestService, getChangePasswordRequestsPipelineService, getChangePasswordRequestCountService, registerChangePasswordRequestService, updateChangePasswordRequestService } from "../../src/services/changePassword.services.js";
import { getUser, getReceiver } from "../../src/helpers/event.helper.js";
import { getTeacherService, updateTeacherService } from "../../src/services/teacher.services.js";
import { convertToMongoId } from "../../src/services/mongoose.services.js";
import { hashPasswordService } from "../../src/services/password.service.js";
import { error, success } from "../../src/utills/responseWrapper.js";
import { StatusCodes } from "http-status-codes";
import otpGenerator from "otp-generator";

jest.mock("../../src/services/password.service.js", () => {
  hashPasswordService: jest.fn()
})

jest.mock("../../src/services/changePassword.services.js", () => ({
  getChangePasswordRequestService: jest.fn(),
  registerChangePasswordRequestService: jest.fn(),
  getChangePasswordRequestsPipelineService: jest.fn(),
  getChangePasswordRequestCountService: jest.fn(),
  updateChangePasswordRequestService: jest.fn()
}));

jest.mock("../../src/helpers/event.helper.js", () => ({
  getUser: jest.fn(),
  getReceiver: jest.fn(),

}));

jest.mock("../../src/utills/responseWrapper.js", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock("../../src/services/teacher.services.js", () => ({
  getTeacherService: jest.fn(),
  updateTeacherService: jest.fn()
}));

jest.mock("otp-generator", () => ({
  generate: jest.fn(() => "12345"),
}));

describe("registerChangePasswordRequestController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        reason: "Forgot password",
        description: "Need to reset my password",
        sender: { phone: "1234567890", model: "teacher" },
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("should successfully register a change password request", async () => {
    const mockSender = { _id: "sender123", admin: "admin123", section: "section1" };
    const mockReceiver = { _id: "admin123" };

    getUser.mockImplementation((model, query) => {
      if (model === "teacher") return Promise.resolve(mockSender);
      if (model === "admin") return Promise.resolve(mockReceiver);
      return Promise.resolve(null);
    });

    getChangePasswordRequestService.mockResolvedValueOnce(null);
    success.mockReturnValue({ status: 200, message: "Request sent successfully" });

    await registerChangePasswordRequestController(req, res);

    expect(getUser).toHaveBeenCalledWith("teacher", { phone: "1234567890" });
    expect(getUser).toHaveBeenCalledWith("admin", { _id: "admin123" });
    expect(registerChangePasswordRequestService).toHaveBeenCalledWith(
      expect.objectContaining({ sender: { id: "sender123", model: "teacher" } })
    );

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, "Request sent successfully"));
  });

  test("should return 404 if sender is not found", async () => {
    getUser.mockResolvedValueOnce(null);
    error.mockReturnValue({ status: 404, message: "Sender not found" });

    await registerChangePasswordRequestController(req, res);

    expect(getUser).toHaveBeenCalledWith("teacher", { phone: "1234567890", isActive: true });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(error(404, "Sender not found"));
  });

  test("should return 409 if teacher is not authorized", async () => {
    const mockSender = { _id: "sender123", admin: "admin123", section: null };
    getUser.mockResolvedValueOnce(mockSender);
    error.mockReturnValue({ status: 409, message: "Teacher in not authorized for forget password" });

    await registerChangePasswordRequestController(req, res);

    expect(getUser).toHaveBeenCalledWith("teacher", { phone: "1234567890", isActive: true });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.send).toHaveBeenCalledWith(error(409, "Teacher in not authorized for forget password"));
  });

  test("should return 409 if request is already approved", async () => {
    const mockSender = { _id: "sender123", admin: "admin123", section: "section1" };
    getUser.mockResolvedValueOnce(mockSender);

    getChangePasswordRequestService.mockResolvedValueOnce({ status: "accept" });
    error.mockReturnValue({ status: 409, message: "Request approved, please change the password" });

    await registerChangePasswordRequestController(req, res);

    expect(getChangePasswordRequestService).toHaveBeenCalledWith({ "sender.id": "sender123", status: { $in: ["pending", "accept"] } });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(res.send).toHaveBeenCalledWith(error(409, "Request approved, please change the password"));
  });

  test("should return 409 if request is still pending", async () => {
    const mockSender = { _id: "sender123", admin: "admin123", section: "section1" };
    getUser.mockResolvedValueOnce(mockSender);

    getChangePasswordRequestService.mockResolvedValueOnce({ status: "pending" });
    error.mockReturnValue({ status: 409, message: "Request is being processed under admin" });

    await registerChangePasswordRequestController(req, res);

    expect(getChangePasswordRequestService).toHaveBeenCalledWith({ "sender.id": "sender123", status: { $in: ["pending", "accept"] } });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(res.send).toHaveBeenCalledWith(error(409, "Request is being processed under admin"));
  });

  test("should return 404 if receiver (admin) is not found", async () => {
    const mockSender = { _id: "sender123", admin: "admin123", section: "section1" };
    getUser.mockResolvedValueOnce(mockSender);
    getUser.mockResolvedValueOnce(null);
    error.mockReturnValue({ status: 404, message: "Receiver not found" });

    await registerChangePasswordRequestController(req, res);

    expect(getUser).toHaveBeenCalledWith("admin", { _id: "admin123", isActive: true });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(error(404, "Receiver not found"));
  });

  test("should return 500 on internal server error", async () => {
    getUser.mockRejectedValueOnce(new Error("Database Error"));
    error.mockReturnValue({ status: 500, message: "Database Error" });

    await registerChangePasswordRequestController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, "Database Error"));
  });
});

describe("getChangePasswordRequestsController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {
        model: "teacher",
        status: "pending",
        page: "1",
        limit: "10",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("should return unauthorized error if receiver details are missing", async () => {
    getReceiver.mockReturnValue([null, null]);
    error.mockReturnValue({ status: 401, message: "Receiver details required!" });

    await getChangePasswordRequestsController(req, res);

    expect(getReceiver).toHaveBeenCalledWith(req);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.send).toHaveBeenCalledWith(error(401, "Receiver details required!"));
  });

  test("should return 500 on internal server error", async () => {
    getReceiver.mockImplementation(() => {
      throw new Error("Database Error");
    });
    error.mockReturnValue({ status: 500, message: "Database Error" });

    await getChangePasswordRequestsController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, "Database Error"));
  });
});

describe("updateChangePasswordRequestByAdminController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { eventId: "event123", status: "accept" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("should return 401 if user is not authorized to update the event", async () => {
    getReceiver.mockReturnValue(["admin", "admin123"]);
    getChangePasswordRequestService.mockResolvedValue({
      _id: "event123",
      receiver: { id: "differentAdmin123" },
    });

    await updateChangePasswordRequestByAdminController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.send).toHaveBeenCalledWith(401, "Unauthorized to update event.");
  });

  test("should update event with OTP and return 200 if status is 'accept'", async () => {
    getReceiver.mockReturnValue(["admin", "admin123"]);
    getChangePasswordRequestService.mockResolvedValue({
      _id: "event123",
      receiver: { id: "admin123" },
    });

    await updateChangePasswordRequestByAdminController(req, res);

    expect(updateChangePasswordRequestService).toHaveBeenCalledWith(
      { _id: "event123" },
      { otp: "12345", status: "accept" }
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, "Event updated successfully"));
  });

  test("should update event without OTP and return 200 if status is 'reject'", async () => {
    req.body.status = "reject";

    getReceiver.mockReturnValue(["admin", "admin123"]);
    getChangePasswordRequestService.mockResolvedValue({
      _id: "event123",
      receiver: { id: "admin123" },
    });

    await updateChangePasswordRequestByAdminController(req, res);

    expect(updateChangePasswordRequestService).toHaveBeenCalledWith(
      { _id: "event123" },
      { status: "reject" }
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, "Event updated successfully"));
  });

  test("should return 500 on internal server error", async () => {
    getReceiver.mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    await updateChangePasswordRequestByAdminController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, "Unexpected error"));
  });
});

describe("verifyTeacherForgetPasswordController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { otp: "12345", phone: "9876543210", deviceId: "device123" }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  test("should return 200 when OTP is correct and device ID matches", async () => {
    const mockTeacher = { _id: "teacher123", deviceId: "device123" };
    const mockRequest = { otp: "12345", reason: "normal" };

    getTeacherService.mockResolvedValue(mockTeacher);
    getChangePasswordRequestService.mockResolvedValue(mockRequest);
    success.mockReturnValue({ status: 200, message: "Success" });

    await verifyTeacherForgetPasswordController(req, res);

    expect(getTeacherService).toHaveBeenCalledWith({ phone: "9876543210" });
    expect(getChangePasswordRequestService).toHaveBeenCalledWith({
      "sender.model": "teacher",
      "sender.id": "teacher123",
      status: "accept"
    });
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, { id: "teacher123" }));
  });

  test("should return 200 and update device ID when reason is 'changeDevice'", async () => {
    const mockTeacher = { _id: "teacher123", deviceId: "oldDevice" };
    const mockRequest = { otp: "12345", reason: "changeDevice" };

    getTeacherService.mockResolvedValue(mockTeacher);
    getChangePasswordRequestService.mockResolvedValue(mockRequest);
    updateTeacherService.mockResolvedValue({});
    success.mockReturnValue({ status: 200, message: "Success" });

    await verifyTeacherForgetPasswordController(req, res);

    expect(updateTeacherService).toHaveBeenCalledWith(
      { _id: "teacher123" },
      { deviceId: "device123" }
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, { id: "teacher123" }));
  });

  test("should return 404 if teacher is not found", async () => {
    getTeacherService.mockResolvedValue(null);
    error.mockReturnValue({ status: 404, message: "Teacher not found" });

    await verifyTeacherForgetPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(error(404, "Teacher not found"));
  });

  test("should return 401 if no forget password request exists", async () => {
    const mockTeacher = { _id: "teacher123", deviceId: "device123" };

    getTeacherService.mockResolvedValue(mockTeacher);
    getChangePasswordRequestService.mockResolvedValue(null);
    error.mockReturnValue({ status: 401, message: "Forget password request not raised" });

    await verifyTeacherForgetPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.send).toHaveBeenCalledWith(error(401, "Forget password request not raised"));
  });

  test("should return 502 if OTP does not match", async () => {
    const mockTeacher = { _id: "teacher123", deviceId: "device123" };
    const mockRequest = { otp: "99999", reason: "normal" };

    getTeacherService.mockResolvedValue(mockTeacher);
    getChangePasswordRequestService.mockResolvedValue(mockRequest);
    error.mockReturnValue({ status: 502, message: "OTP not matched" });

    await verifyTeacherForgetPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_GATEWAY);
    expect(res.send).toHaveBeenCalledWith(error(502, "OTP not matched"));
  });

  test("should return 502 if device ID does not match and reason is not 'changeDevice'", async () => {
    const mockTeacher = { _id: "teacher123", deviceId: "oldDevice" };
    const mockRequest = { otp: "12345", reason: "normal" };

    getTeacherService.mockResolvedValue(mockTeacher);
    getChangePasswordRequestService.mockResolvedValue(mockRequest);
    error.mockReturnValue({ status: 502, message: "Access denied due to device mismatch" });

    await verifyTeacherForgetPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_GATEWAY);
    expect(res.send).toHaveBeenCalledWith(error(502, "Access denied due to device mismatch"));
  });

  test("should return 500 on internal server error", async () => {
    getTeacherService.mockRejectedValue(new Error("Database error"));
    error.mockReturnValue({ status: 500, message: "Internal Server Error" });

    await verifyTeacherForgetPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, "Database error"));
  });
});

describe("changePasswordByVerifiedTeacherController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { id: "teacher123", password: "newPass@123", deviceId: "device123" }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  test("should return 404 if teacher is not found", async () => {
    getTeacherService.mockResolvedValue(null);
    error.mockReturnValue({ status: 404, message: "Teacher not found" });

    await changePasswordByVerifiedTeacherController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(error(404, "Teacher not found"));
  });

  test("should return 404 if device ID does not match", async () => {
    const mockTeacher = { _id: "teacher123", deviceId: "wrongDevice", forgetPasswordCount: 1 };

    getTeacherService.mockResolvedValue(mockTeacher);
    error.mockReturnValue({ status: 404, message: "Access denied due to device mismatch" });

    await changePasswordByVerifiedTeacherController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(error(404, "Access denied due to device mismatch"));
  });

  test("should return 500 on internal server error", async () => {
    getTeacherService.mockRejectedValue(new Error("Database error"));
    error.mockReturnValue({ status: 500, message: "Internal Server Error" });

    await changePasswordByVerifiedTeacherController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, "Database error"));
  });
});
