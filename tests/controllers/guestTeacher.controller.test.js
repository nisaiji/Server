import { updateGuestTeacherController } from "../../src/controllers/guestTeacher.controller.js";
import { getGuestTeacherService, updateGuestTeacherService } from "../../src/services/guestTeacher.service.js";
import { hashPasswordService } from "../../src/services/password.service.js";
import { error, success } from "../../src/utills/responseWrapper.js";
import { StatusCodes } from "http-status-codes";

jest.mock("../../src/services/guestTeacher.service.js", () => ({
  getGuestTeacherService: jest.fn(),
  updateGuestTeacherService: jest.fn(),
}));

jest.mock("../../src/services/password.service.js", () => ({
  hashPasswordService: jest.fn(),
}));

jest.mock("../../src/utills/responseWrapper.js", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe("updateGuestTeacherController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      teacherId: "teacher123",
      body: {
        username: "newUsername",
        tagline: "New tagline",
        password: "newPassword",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("should successfully update a guest teacher", async () => {
    const mockTeacher = { _id: "teacher123", username: "oldUsername", tagline: "Old tagline" };
    getGuestTeacherService.mockResolvedValueOnce(mockTeacher);
    hashPasswordService.mockResolvedValueOnce("hashedPassword");
    success.mockReturnValue({ status: 200, message: "Teacher updated successfully" });

    await updateGuestTeacherController(req, res);

    expect(getGuestTeacherService).toHaveBeenCalledWith({ _id: "teacher123" });
    expect(hashPasswordService).toHaveBeenCalledWith("newPassword");
    expect(updateGuestTeacherService).toHaveBeenCalledWith(
      { _id: "teacher123" },
      { username: "newUsername", tagline: "New tagline", password: "hashedPassword" }
    );

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, "Teacher updated successfully"));
  });

  test("should return 404 if the guest teacher is not found", async () => {
    getGuestTeacherService.mockResolvedValueOnce(null);
    error.mockReturnValue({ status: 404, message: "Teacher not found" });

    await updateGuestTeacherController(req, res);

    expect(getGuestTeacherService).toHaveBeenCalledWith({ _id: "teacher123" });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.send).toHaveBeenCalledWith(error(404, "Teacher not found"));
  });

  test("should return 500 on internal server error", async () => {
    getGuestTeacherService.mockRejectedValueOnce(new Error("Database Error"));
    error.mockReturnValue({ status: 500, message: "Database Error" });

    await updateGuestTeacherController(req, res);

    expect(getGuestTeacherService).toHaveBeenCalledWith({ _id: "teacher123" });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, "Database Error"));
  });
});
