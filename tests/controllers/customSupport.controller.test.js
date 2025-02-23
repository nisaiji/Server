import { StatusCodes } from "http-status-codes";
import { createCustomerSupportQueryController } from "../../src/controllers/customerSupport.controller.js";
import { registerCustomerSupportQueryService } from "../../src/services/customerSupport.services.js";

jest.mock("../../src/services/customerSupport.services.js");

describe("createCustomerSupportQueryController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        firstname: "John",
        lastname: "Doe",
        schoolName: "Test School",
        state: "NY",
        city: "New York",
        teacherCount: 10,
        source: "Website",
        email: "john.doe@example.com",
        phone: "1234567890",
        message: "I need help with my query."
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should register customer support query successfully", async () => {
    registerCustomerSupportQueryService.mockResolvedValueOnce({});

    await createCustomerSupportQueryController(req, res);

    expect(registerCustomerSupportQueryService).toHaveBeenCalledWith({
      firstname: "John",
      lastname: "Doe",
      schoolName: "Test School",
      state: "NY",
      city: "New York",
      teacherCount: 10,
      source: "Website",
      email: "john.doe@example.com",
      phone: "1234567890",
      message: "I need help with my query."
    });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith({
      status: "success",
      statusCode: 200,
      msg: "Query registered successfully"
    });
  });

  test("should return error when registerCustomerSupportQueryService throws an error", async () => {
    const error = new Error("Service error");
    registerCustomerSupportQueryService.mockRejectedValueOnce(error);

    await createCustomerSupportQueryController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith({
      status: "error",
      statusCode: 500,
      msg: error.message
    });
  });
});
