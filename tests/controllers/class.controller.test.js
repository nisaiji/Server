import { StatusCodes } from "http-status-codes";
import { registerClassController, deleteClassController, getClassController, getClassListController  } from "../../src/controllers/class.controller.js";
import { getClassService, registerClassService, deleteClassService, getClassWithSectionsService, customGetClassWithSectionTeacherService   } from "../../src/services/class.sevices.js";
import { error, success } from "../../src/utills/responseWrapper.js";

jest.mock("../../src/services/class.sevices.js", () => ({
  getClassService: jest.fn(),
  registerClassService: jest.fn(),
  deleteClassService: jest.fn(),
  customGetClassWithSectionTeacherService : jest.fn(),
  getClassWithSectionsService : jest.fn()
}));

jest.mock("../../src/utills/responseWrapper.js", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe("registerClassController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      adminId: "admin123",
      body: {
        name: "Class A",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("should register a new class successfully", async () => {
    getClassService.mockResolvedValueOnce(null);
    registerClassService.mockResolvedValueOnce({});

    success.mockReturnValue({ status: 200, message: "Class registered successfully" });

    await registerClassController(req, res);

    expect(getClassService).toHaveBeenCalledWith({ name: "Class A", admin: "admin123" });
    expect(registerClassService).toHaveBeenCalledWith({ name: "Class A", admin: "admin123" });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, "Class registered successfully"));
  });

  test("should return 409 if class already exists", async () => {
    const existingClass = { _id: "class1", name: "Class A", admin: "admin123" };
    getClassService.mockResolvedValueOnce(existingClass);

    await registerClassController(req, res);

    expect(getClassService).toHaveBeenCalledWith({ name: "Class A", admin: "admin123" });
    expect(registerClassService).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(res.send).toHaveBeenCalledWith(error(409, "Class already exists"));
  });

  test("should return 500 on internal server error", async () => {
    getClassService.mockRejectedValueOnce(new Error("Database Error"));

    await registerClassController(req, res);

    expect(getClassService).toHaveBeenCalledWith({ name: "Class A", admin: "admin123" });
    expect(registerClassService).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, "Database Error"));
  });
});

describe("deleteClassController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      adminId: "admin123",
      params: { classId: "class1" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("should successfully delete a class", async () => {
    const mockClass = { _id: "class1", name: "Class A", section: [] };
    getClassService.mockResolvedValueOnce(mockClass);
    deleteClassService.mockResolvedValueOnce({});

    success.mockReturnValue({ status: 200, message: "Class deleted successfully" });

    await deleteClassController(req, res);

    expect(getClassService).toHaveBeenCalledWith({ _id: "class1" });
    expect(deleteClassService).toHaveBeenCalledWith({ _id: "class1" });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, "Class deleted successfully"));
  });

  test("should return 400 if class does not exist", async () => {
    getClassService.mockResolvedValueOnce(null);

    await deleteClassController(req, res);

    expect(getClassService).toHaveBeenCalledWith({ _id: "class1" });
    expect(deleteClassService).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(error(400, "Class doesn't exists"));
  });

  test("should return 406 if class has sections", async () => {
    const mockClass = { _id: "class1", name: "Class A", section: ["section1"] };
    getClassService.mockResolvedValueOnce(mockClass);

    await deleteClassController(req, res);

    expect(getClassService).toHaveBeenCalledWith({ _id: "class1" });
    expect(deleteClassService).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_ACCEPTABLE);
    expect(res.send).toHaveBeenCalledWith(error(406, "Class has sections."));
  });

  test("should return 500 on internal server error", async () => {
    getClassService.mockRejectedValueOnce(new Error("Database Error"));

    await deleteClassController(req, res);

    expect(getClassService).toHaveBeenCalledWith({ _id: "class1" });
    expect(deleteClassService).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, "Database Error"));
  });
});

describe("getClassController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { classId: "class1" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("should successfully return class info", async () => {
    const mockClassInfo = { _id: "class1", name: "Class A", sections: [] };
    customGetClassWithSectionTeacherService .mockResolvedValueOnce(mockClassInfo);
    success.mockReturnValue({ status: 200, data: { class: mockClassInfo } });

    await getClassController(req, res);

    expect(customGetClassWithSectionTeacherService ).toHaveBeenCalledWith({ _id: "class1" });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, { class: mockClassInfo }));
  });

  test("should return empty response if class is not found", async () => {
    customGetClassWithSectionTeacherService .mockResolvedValueOnce(null);

    await getClassController(req, res);

    expect(customGetClassWithSectionTeacherService ).toHaveBeenCalledWith({ _id: "class1" });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, { class: null }));
  });

  test("should return 500 on internal server error", async () => {
    customGetClassWithSectionTeacherService .mockRejectedValueOnce(new Error("Database Error"));

    await getClassController(req, res);

    expect(customGetClassWithSectionTeacherService ).toHaveBeenCalledWith({ _id: "class1" });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, "Database Error"));
  });
});

describe("getClassListController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      adminId: "admin123",
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("should successfully return a list of classes", async () => {
    const mockClassList = [
      { _id: "class1", name: "Class A", sections: [] },
      { _id: "class2", name: "Class B", sections: [] },
    ];

    getClassWithSectionsService.mockResolvedValueOnce(mockClassList);
    success.mockReturnValue({ status: 200, data: mockClassList });

    await getClassListController(req, res);

    expect(getClassWithSectionsService).toHaveBeenCalledWith({ admin: "admin123" });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, mockClassList));
  });

  test("should return an empty list if no classes are found", async () => {
    getClassWithSectionsService.mockResolvedValueOnce([]);
    
    await getClassListController(req, res);

    expect(getClassWithSectionsService).toHaveBeenCalledWith({ admin: "admin123" });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, []));
  });

  test("should return 500 on internal server error", async () => {
    getClassWithSectionsService.mockRejectedValueOnce(new Error("Database Error"));

    await getClassListController(req, res);

    expect(getClassWithSectionsService).toHaveBeenCalledWith({ admin: "admin123" });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, "Database Error"));
  });
});
