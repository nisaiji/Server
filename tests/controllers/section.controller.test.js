import { registerSectionController, assignGuestTeacherController, replaceTeacherController, getSectionController, deleteSectionController, getAllSectionsController } from "../../src/controllers/section.controller.js";
import { getClassService, updateClassService } from "../../src/services/class.sevices.js";
import {  deleteSectionService, getAllSection, getSectionService, registerSectionService, updateSectionService } from "../../src/services/section.services.js";
import {  getTeacherService, updateTeacherService  } from "../../src/services/teacher.services.js";
import { success, error } from "../../src/utills/responseWrapper.js";
import { StatusCodes } from "http-status-codes";

jest.mock("../../src/services/class.sevices.js");
jest.mock("../../src/services/section.services.js");
jest.mock("../../src/services/teacher.services.js");
jest.mock("../../src/utills/responseWrapper.js", () => ({
  success: jest.fn((status, message) => ({ status, message })),
  error: jest.fn((status, message) => ({ status, message }))
}));

describe("registerSectionController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { name: "A", startTime: "08:00", teacherId: "teacher123", classId: "class123" },
      adminId: "admin123"
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
  });

  it("should return 404 if class not found", async () => {
    getClassService.mockResolvedValue(null);

    await registerSectionController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(error(404, "Class not found"));
  });

  it("should return 409 if section already exists", async () => {
    getClassService.mockResolvedValue({ _id: "class123" });
    getSectionService.mockResolvedValue({ name: "A" });

    await registerSectionController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(res.send).toHaveBeenCalledWith(error(409, "Section already exists"));
  });

  it("should return 404 if teacher not found", async () => {
    getClassService.mockResolvedValue({ _id: "class123", section: [] });
    getSectionService.mockResolvedValue(null);
    registerSectionService.mockResolvedValue({ _id: "section123" });
    getTeacherService.mockResolvedValue(null);

    await registerSectionController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(error(404, "Teacher not found"));
  });

  it("should return 400 if teacher is already assigned to a section", async () => {
    getClassService.mockResolvedValue({ _id: "class123", section: [] });
    getSectionService.mockResolvedValue(null);
    registerSectionService.mockResolvedValue({ _id: "section123" });
    getTeacherService.mockResolvedValue({ _id: "teacher123", section: "section456" });

    await registerSectionController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.send).toHaveBeenCalledWith(error(400, "Teacher already assigned to section"));
  });

  it("should create section and update teacher/class", async () => {
    const classInfo = { _id: "class123", section: [], save: jest.fn() };
    const teacher = { _id: "teacher123", save: jest.fn() };
    const section = { _id: "section123" };

    getClassService.mockResolvedValue(classInfo);
    getSectionService.mockResolvedValue(null);
    registerSectionService.mockResolvedValue(section);
    getTeacherService.mockResolvedValue(teacher);

    await registerSectionController(req, res);

    expect(teacher.section).toBe(section._id);
    expect(classInfo.section).toContain(section._id);
    expect(teacher.save).toHaveBeenCalled();
    expect(classInfo.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(201, "Section created successfully!"));
  });

  it("should handle errors and return 500", async () => {
    getClassService.mockRejectedValue(new Error("Database error"));

    await registerSectionController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, "Database error"));
  });
});

describe("getSectionController", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { sectionId: "section123" } };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  });

  it("should return 404 if section not found", async () => {
    getSectionService.mockResolvedValue(null);

    await getSectionController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(error(400, "Section not found."));
  });

  it("should return section and teacher data when found", async () => {
    const sectionData = { _id: "section123", name: "A1" };
    const teacherData = { firstname: "John", lastname: "Doe" };

    getSectionService.mockResolvedValue(sectionData);
    getTeacherService.mockResolvedValue(teacherData);
    success.mockReturnValue({ status: 200, data: { section: sectionData, teacher: teacherData } });

    await getSectionController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, { section: sectionData, teacher: teacherData }));
  });

  it("should return 500 if an error occurs", async () => {
    const errorMessage = "Database error";
    getSectionService.mockRejectedValue(new Error(errorMessage));

    await getSectionController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, errorMessage));
  });
});
 
describe("deleteSectionController", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { sectionId: "section123" }, adminId: "admin123" };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  });

  it("should return 404 if section not found", async () => {
    getSectionService.mockResolvedValue(null);

    await deleteSectionController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(error(404, "Section not found"));
  });

  it("should return 400 if section contains students", async () => {
    getSectionService.mockResolvedValue({ studentCount: 5 });

    await deleteSectionController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.send).toHaveBeenCalledWith(error(400, "section contains students"));
  });

  it("should delete section, update class and teacher, and return success", async () => {
    const sectionData = { _id: "section123", classId: "class456", teacher: "teacher789", studentCount: 0 };

    getSectionService.mockResolvedValue(sectionData);
    deleteSectionService.mockResolvedValue({});
    updateClassService.mockResolvedValue({});
    updateTeacherService.mockResolvedValue({});
    success.mockReturnValue({ status: 200, message: "section deleted successfully" });

    await deleteSectionController(req, res);

    expect(deleteSectionService).toHaveBeenCalledWith({ _id: "section123" });
    expect(updateClassService).toHaveBeenCalledWith({ _id: "class456" }, { $pull: { section: "section123" } });
    expect(updateTeacherService).toHaveBeenCalledWith({ _id: "teacher789" }, { section: null });
    expect(res.send).toHaveBeenCalledWith(success(200, "section deleted successfully"));
  });

  it("should return 500 if an error occurs", async () => {
    const errorMessage = "Database error";
    getSectionService.mockRejectedValue(new Error(errorMessage));

    await deleteSectionController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, errorMessage));
  });
});

describe("getAllSectionsController", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  });

  it("should return all sections successfully", async () => {
    const sectionList = [
      { _id: "section1", name: "Section A" },
      { _id: "section2", name: "Section B" },
    ];
    
    getAllSection.mockResolvedValue(sectionList);
    success.mockReturnValue({ status: 200, data: sectionList });

    await getAllSectionsController(req, res);

    expect(getAllSection).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith(success(200, sectionList));
  });

  it("should return empty list if no sections found", async () => {
    getAllSection.mockResolvedValue([]);
    success.mockReturnValue({ status: 200, data: [] });

    await getAllSectionsController(req, res);

    expect(getAllSection).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith(success(200, []));
  });

  it("should return 500 if an error occurs", async () => {
    const errorMessage = "Database error";
    getAllSection.mockRejectedValue(new Error(errorMessage));

    await getAllSectionsController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, errorMessage));
  });
});

describe("replaceTeacherController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      adminId: "admin123",
      body: {
        sectionId: "section1",
        teacherId: "teacher2"
      }
    };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  });

  it("should successfully replace the teacher", async () => {
    const section = { _id: "section1", teacher: "teacher1", save: jest.fn() };
    const prevTeacher = { _id: "teacher1", section: "section1", save: jest.fn() };
    const newTeacher = { _id: "teacher2", section: null, save: jest.fn() };

    getSectionService.mockResolvedValue(section);
    getTeacherService.mockResolvedValueOnce(prevTeacher).mockResolvedValueOnce(newTeacher);
    success.mockReturnValue({ status: 200, message: "Teacher changed successfully" });

    await replaceTeacherController(req, res);

    expect(section.teacher).toBe("teacher2");
    expect(prevTeacher.section).toBeNull();
    expect(newTeacher.section).toBe("section1");

    expect(section.save).toHaveBeenCalled();
    expect(prevTeacher.save).toHaveBeenCalled();
    expect(newTeacher.save).toHaveBeenCalled();
    
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, "Teacher changed successfully"));
  });

  it("should return 404 if section does not exist", async () => {
    getSectionService.mockResolvedValue(null);

    await replaceTeacherController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(error(404, "Section doesn't exists"));
  });

  it("should return 404 if the new teacher does not exist", async () => {
    const section = { _id: "section1", teacher: "teacher1" };
    const prevTeacher = { _id: "teacher1", section: "section1" };

    getSectionService.mockResolvedValue(section);
    getTeacherService.mockResolvedValueOnce(prevTeacher).mockResolvedValueOnce(null);

    await replaceTeacherController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(error(404, "Teacher doesn't exists"));
  });

  it("should return 409 if the new teacher is already assigned to a section", async () => {
    const section = { _id: "section1", teacher: "teacher1" };
    const prevTeacher = { _id: "teacher1", section: "section1" };
    const newTeacher = { _id: "teacher2", section: "section2" };

    getSectionService.mockResolvedValue(section);
    getTeacherService.mockResolvedValueOnce(prevTeacher).mockResolvedValueOnce(newTeacher);

    await replaceTeacherController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.send).toHaveBeenCalledWith(error(409, "Teacher already occupied"));
  });

  it("should return 500 if an error occurs", async () => {
    const errorMessage = "Database error";
    getSectionService.mockRejectedValue(new Error(errorMessage));

    await replaceTeacherController(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error(500, errorMessage));
  });
});

// describe("assignGuestTeacherController", () => {
//   let req, res;

//   beforeEach(() => {
//     req = {
//       adminId: "admin123",
//       body: {
//         guestTeacherId: "guestTeacher1",
//         sectionId: "section1",
//         teacherId: "teacher1",
//       },
//     };

//     res = {
//       status: jest.fn().mockReturnThis(),
//       send: jest.fn(),
//     };

//     jest.clearAllMocks();
//   });

//   test("should successfully assign a guest teacher", async () => {
//     const teacher = { _id: "teacher1", admin: "admin123", isActive: true };
//     const guestTeacher = { _id: "guestTeacher1", admin: "admin123", isActive: true };
//     const section = { _id: "section1", teacher: "teacher1" };

//     getTeacherService.mockResolvedValueOnce(teacher);
//     getTeacherService.mockResolvedValueOnce(guestTeacher);
//     getSectionService.mockResolvedValueOnce(section);
//     getSectionService.mockResolvedValueOnce(null); // Guest teacher is not assigned anywhere

//     updateSectionService.mockResolvedValue({});

//     success.mockReturnValue({ status: 200, message: "Guest teacher assigned successfully." });

//     await assignGuestTeacherController(req, res);

//     expect(updateSectionService).toHaveBeenCalledWith(
//       { _id: "section1" },
//       { guestTeacher: "guestTeacher1" }
//     );

//     expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
//     expect(res.send).toHaveBeenCalledWith(success(200, "Guest teacher assigned successfully."));
//   });

//   test("should return 404 if teacher is not found", async () => {
//     getTeacherService.mockResolvedValueOnce(null);

//     await assignGuestTeacherController(req, res);

//     expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
//     expect(res.send).toHaveBeenCalledWith(error(404, "Teacher not found."));
//   });

//   test("should return 404 if guest teacher is not found", async () => {
//     const teacher = { _id: "teacher1", admin: "admin123", isActive: true };

//     getTeacherService.mockResolvedValueOnce(teacher);
//     getTeacherService.mockResolvedValueOnce(null);

//     await assignGuestTeacherController(req, res);

//     expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
//     expect(res.send).toHaveBeenCalledWith(error(404, "Guest Teacher not found."));
//   });

//   test("should return 400 if guest teacher is already assigned", async () => {
//     const teacher = { _id: "teacher1", admin: "admin123", isActive: true };
//     const guestTeacher = { _id: "guestTeacher1", admin: "admin123", isActive: true };
//     const section = { _id: "section1", teacher: "teacher1" };
//     const guestTeacherSection = { _id: "section2", guestTeacher: "guestTeacher1" };

//     getTeacherService.mockResolvedValueOnce(teacher);
//     getTeacherService.mockResolvedValueOnce(guestTeacher);
//     getSectionService.mockResolvedValueOnce(section);
//     getSectionService.mockResolvedValueOnce(guestTeacherSection); // Already assigned

//     await assignGuestTeacherController(req, res);

//     expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
//     expect(res.send).toHaveBeenCalledWith(error(400, "Guest Teacher already assigned."));
//   });

//   test("should return 404 if section is not found", async () => {
//     const teacher = { _id: "teacher1", admin: "admin123", isActive: true };
//     const guestTeacher = { _id: "guestTeacher1", admin: "admin123", isActive: true };

//     getTeacherService.mockResolvedValueOnce(teacher);
//     getTeacherService.mockResolvedValueOnce(guestTeacher);
//     getSectionService.mockResolvedValueOnce(null);

//     await assignGuestTeacherController(req, res);

//     expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
//     expect(res.send).toHaveBeenCalledWith(error(404, "Section not found."));
//   });

//   test("should return 400 if section teacher mismatch", async () => {
//     const teacher = { _id: "teacher1", admin: "admin123", isActive: true };
//     const guestTeacher = { _id: "guestTeacher1", admin: "admin123", isActive: true };
//     const section = { _id: "section1", teacher: "anotherTeacher" }; // Different teacher

//     getTeacherService.mockResolvedValueOnce(teacher);
//     getTeacherService.mockResolvedValueOnce(guestTeacher);
//     getSectionService.mockResolvedValueOnce(section);
//     getSectionService.mockResolvedValueOnce(null);

//     await assignGuestTeacherController(req, res);

//     expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
//     expect(res.send).toHaveBeenCalledWith(error(400, "Section Teacher mismatch."));
//   });

//   test("should return 500 on internal server error", async () => {
//     getTeacherService.mockRejectedValueOnce(new Error("Database Error"));

//     await assignGuestTeacherController(req, res);

//     expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
//     expect(res.send).toHaveBeenCalledWith(error(500, "Database Error"));
//   });
// });