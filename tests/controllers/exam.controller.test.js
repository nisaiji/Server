import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { StatusCodes } from "http-status-codes";

const getExamService = jest.fn();
const updateExamService = jest.fn();
const sendPushNotification = jest.fn();
const getSectionParentNotificationRecipientsService = jest.fn();
const getExamTeacherNotificationRecipientsService = jest.fn();
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

await jest.unstable_mockModule("../../src/services/exam.services.js", () => ({
  createExamService: jest.fn(),
  getExamService,
  getExamsPipelineService: jest.fn(),
  updateExamService,
}));

await jest.unstable_mockModule("../../src/config/firebase.config.js", () => ({
  sendPushNotification,
}));

await jest.unstable_mockModule("../../src/services/notificationRecipient.service.js", () => ({
  dedupeNotificationRecipientsService,
  getExamTeacherNotificationRecipientsService,
  getSectionParentNotificationRecipientsService,
}));

await jest.unstable_mockModule("../../src/utills/responseWrapper.js", () => ({
  success,
  error,
}));

const { updateExamController } = await import("../../src/controllers/exam.controller.js");

describe("updateExamController", () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: {
        examId: "exam-123",
      },
      body: {},
      adminId: "school-1",
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("does not notify on a regular exam edit", async () => {
    req.body = {
      name: "Updated Mid Term",
      description: "Updated description",
      status: "scheduled",
    };

    getExamService.mockResolvedValue({
      _id: "exam-123",
      school: "school-1",
      session: "session-1",
      section: "section-1",
      name: "Mid Term",
      resultPublished: false,
      subjects: [{ subject: "subject-1" }],
    });
    updateExamService.mockResolvedValue({ _id: "exam-123" });

    await updateExamController(req, res);

    expect(updateExamService).toHaveBeenCalledWith(
      { _id: "exam-123" },
      {
        name: "Updated Mid Term",
        description: "Updated description",
        status: "scheduled",
      },
    );
    expect(getSectionParentNotificationRecipientsService).not.toHaveBeenCalled();
    expect(getExamTeacherNotificationRecipientsService).not.toHaveBeenCalled();
    expect(sendPushNotification).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(success(200, "Exam updated successfully"));
  });

  test("notifies only when exam results transition from unpublished to published", async () => {
    req.body = {
      resultPublished: "true",
    };

    getExamService.mockResolvedValue({
      _id: "exam-123",
      school: "school-1",
      session: "session-1",
      section: "section-1",
      name: "Final Exam",
      resultPublished: false,
      subjects: [{ subject: "subject-1" }, { subject: "subject-2" }],
    });
    updateExamService.mockResolvedValue({ _id: "exam-123" });
    getSectionParentNotificationRecipientsService.mockResolvedValue([
      { recipientId: "parent-1", fcmToken: "parent-token-1" },
      { recipientId: "parent-2", fcmToken: "shared-token" },
    ]);
    getExamTeacherNotificationRecipientsService.mockResolvedValue([
      { recipientId: "teacher-1", fcmToken: "shared-token" },
      { recipientId: "teacher-2", fcmToken: "teacher-token-2" },
    ]);
    sendPushNotification.mockResolvedValue({ status: "sent" });

    await updateExamController(req, res);

    expect(updateExamService).toHaveBeenCalledWith(
      { _id: "exam-123" },
      expect.objectContaining({
        resultPublished: true,
        resultPublishedAt: expect.any(Date),
      }),
    );
    expect(getSectionParentNotificationRecipientsService).toHaveBeenCalledWith({
      sectionId: "section-1",
      sessionId: "session-1",
      schoolId: "school-1",
    });
    expect(getExamTeacherNotificationRecipientsService).toHaveBeenCalledWith({
      sectionId: "section-1",
      sessionId: "session-1",
      schoolId: "school-1",
      subjectIds: ["subject-1", "subject-2"],
    });
    expect(sendPushNotification).toHaveBeenCalledTimes(3);
    expect(sendPushNotification).toHaveBeenCalledWith(
      "parent-token-1",
      "Exam Result Published",
      expect.stringContaining("Final Exam"),
      "exam",
      "exam-123",
    );
    expect(sendPushNotification).toHaveBeenCalledWith(
      "teacher-token-2",
      "Exam Result Published",
      expect.stringContaining("Results for Final Exam are now available."),
      "exam",
      "exam-123",
    );
  });

  test("clears resultPublishedAt and skips notifications when results are explicitly unpublished", async () => {
    req.body = {
      resultPublished: "false",
    };

    getExamService.mockResolvedValue({
      _id: "exam-123",
      school: "school-1",
      session: "session-1",
      section: "section-1",
      name: "Final Exam",
      resultPublished: true,
      subjects: [{ subject: "subject-1" }],
    });
    updateExamService.mockResolvedValue({ _id: "exam-123" });

    await updateExamController(req, res);

    expect(updateExamService).toHaveBeenCalledWith(
      { _id: "exam-123" },
      {
        resultPublished: false,
        resultPublishedAt: null,
      },
    );
    expect(getSectionParentNotificationRecipientsService).not.toHaveBeenCalled();
    expect(getExamTeacherNotificationRecipientsService).not.toHaveBeenCalled();
    expect(sendPushNotification).not.toHaveBeenCalled();
  });
});
