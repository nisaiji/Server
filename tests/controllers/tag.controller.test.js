import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { StatusCodes } from "http-status-codes";

const createTagService = jest.fn();
const getSubjectService = jest.fn();
const getTeacherSubjectSectionService = jest.fn();
const getSessionService = jest.fn();
const getStartAndEndTimeService = jest.fn();
const timestampToIstDate = jest.fn();
const getFormattedDateService = jest.fn((date) => date.toISOString().slice(0, 10));
const sendPushNotification = jest.fn();
const getSectionParentNotificationRecipientsService = jest.fn();
const getTagTeacherNotificationRecipientsService = jest.fn();
const dedupeNotificationRecipientsService = jest.fn((recipients) => {
  const seenTokens = new Set();

  return recipients.filter((recipient) => {
    const token = recipient?.fcmToken;

    if (!token || seenTokens.has(token)) {
      return false;
    }

    seenTokens.add(token);
    return true;
  });
});
const success = jest.fn((statusCode, message) => ({ statusCode, message }));
const error = jest.fn((statusCode, message) => ({ statusCode, message }));

await jest.unstable_mockModule("../../src/services/tag.service.js", () => ({
  createTagService,
  deleteTagService: jest.fn(),
  getTagService: jest.fn(),
  getTagsPipelineService: jest.fn(),
  updateTagService: jest.fn(),
}));

await jest.unstable_mockModule("../../src/services/subject.service.js", () => ({
  getSubjectService,
}));

await jest.unstable_mockModule("../../src/services/teacherSubjectSection.service.js", () => ({
  getTeacherSubjectSectionService,
}));

await jest.unstable_mockModule("../../src/services/session.services.js", () => ({
  getSessionService,
}));

await jest.unstable_mockModule("../../src/services/celender.service.js", () => ({
  getFormattedDateService,
  getStartAndEndTimeService,
  timestampToIstDate,
}));

await jest.unstable_mockModule("../../src/config/firebase.config.js", () => ({
  sendPushNotification,
}));

await jest.unstable_mockModule("../../src/services/notificationRecipient.service.js", () => ({
  dedupeNotificationRecipientsService,
  getSectionParentNotificationRecipientsService,
  getTagTeacherNotificationRecipientsService,
}));

await jest.unstable_mockModule("../../src/utills/responseWrapper.js", () => ({
  success,
  error,
}));

const { createTagController } = await import("../../src/controllers/tag.controller.js");

describe("createTagController", () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {
        subjectId: "subject-1",
        sectionId: "section-1",
        sessionId: "session-1",
        startDate: "1",
        endDate: "2",
        classId: "class-1",
        title: "Homework Revision",
        description: "Complete chapter 5",
      },
      teacherId: "teacher-1",
      adminId: "school-1",
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("creates all daily tags and sends one deduped summary notification per recipient", async () => {
    getSessionService.mockResolvedValue({ status: "ongoing" });
    getSubjectService.mockResolvedValue({ name: "Mathematics" });
    getTeacherSubjectSectionService.mockResolvedValue({ _id: "teacher-subject-1" });
    getStartAndEndTimeService.mockReturnValueOnce({
      startTime: 101,
      endTime: 103,
    });
    timestampToIstDate.mockImplementation((value) => {
      const dateMap = {
        1: new Date("2025-01-01T00:00:00.000Z"),
        2: new Date("2025-01-03T00:00:00.000Z"),
        101: new Date("2025-01-01T00:00:00.000Z"),
        103: new Date("2025-01-03T00:00:00.000Z"),
      };

      return dateMap[value];
    });
    createTagService.mockResolvedValue({ _id: "tag-1" });
    getSectionParentNotificationRecipientsService.mockResolvedValue([
      { recipientId: "parent-1", fcmToken: "parent-token-1" },
      { recipientId: "parent-2", fcmToken: "shared-token" },
    ]);
    getTagTeacherNotificationRecipientsService.mockResolvedValue([
      { recipientId: "teacher-2", fcmToken: "shared-token" },
      { recipientId: "teacher-3", fcmToken: "teacher-token-3" },
    ]);
    sendPushNotification.mockResolvedValue({ status: "sent" });

    await createTagController(req, res);

    expect(createTagService).toHaveBeenCalledTimes(3);
    expect(getSectionParentNotificationRecipientsService).toHaveBeenCalledWith({
      sectionId: "section-1",
      sessionId: "session-1",
      schoolId: "school-1",
    });
    expect(getTagTeacherNotificationRecipientsService).toHaveBeenCalledWith({
      sectionId: "section-1",
      subjectId: "subject-1",
      sessionId: "session-1",
      schoolId: "school-1",
      excludeTeacherId: "teacher-1",
    });
    expect(dedupeNotificationRecipientsService).toHaveBeenCalled();
    expect(sendPushNotification).toHaveBeenCalledTimes(3);
    expect(sendPushNotification).toHaveBeenCalledWith(
      "parent-token-1",
      "New Tag Added",
      expect.stringContaining("Homework Revision"),
      "tag",
    );
    expect(sendPushNotification).toHaveBeenCalledWith(
      "shared-token",
      "New Tag Added",
      expect.stringContaining("2025-01-01 to 2025-01-03"),
      "tag",
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
    expect(res.send).toHaveBeenCalledWith(success(201, "Tag created successfully"));
  });

  test("skips notification work when the request range is invalid", async () => {
    req.body.startDate = "10";
    req.body.endDate = "5";

    await createTagController(req, res);

    expect(createTagService).not.toHaveBeenCalled();
    expect(getSectionParentNotificationRecipientsService).not.toHaveBeenCalled();
    expect(getTagTeacherNotificationRecipientsService).not.toHaveBeenCalled();
    expect(sendPushNotification).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.send).toHaveBeenCalledWith(error(400, "Start date must be less than end date"));
  });

  test("skips notification work when the teacher is not authorized", async () => {
    getSessionService.mockResolvedValue({ status: "ongoing" });
    getSubjectService.mockResolvedValue({ name: "Mathematics" });
    getTeacherSubjectSectionService.mockResolvedValue(null);

    await createTagController(req, res);

    expect(createTagService).not.toHaveBeenCalled();
    expect(getSectionParentNotificationRecipientsService).not.toHaveBeenCalled();
    expect(getTagTeacherNotificationRecipientsService).not.toHaveBeenCalled();
    expect(sendPushNotification).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith(error(404, "Teacher is not authorized for this action"));
  });
});
