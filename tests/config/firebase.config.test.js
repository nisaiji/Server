import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const send = jest.fn();
const messaging = jest.fn(() => ({ send }));
const initializeApp = jest.fn();
const cert = jest.fn(() => "mock-credential");
const loggerError = jest.fn();

await jest.unstable_mockModule("firebase-admin", () => ({
  default: {
    apps: [],
    credential: {
      cert,
    },
    initializeApp,
    messaging,
  },
}));

await jest.unstable_mockModule("../../src/logger/index.js", () => ({
  default: {
    error: loggerError,
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    http: jest.fn(),
  },
}));

const { sendPushNotification } = await import("../../src/config/firebase.config.js");

describe("sendPushNotification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("uses imageUrl and stringifies data payload values", async () => {
    send.mockResolvedValue("message-id-1");

    const result = await sendPushNotification("device-token", "Exam Result Published", "Results are ready", "exam", 12345);

    expect(result).toEqual({
      status: "sent",
      messageId: "message-id-1",
    });
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        token: "device-token",
        notification: expect.objectContaining({
          title: "Exam Result Published",
          body: "Results are ready",
          imageUrl: expect.any(String),
        }),
        data: {
          route: "exam",
          id: "12345",
        },
      }),
    );
  });

  test("omits undefined data keys", async () => {
    send.mockResolvedValue("message-id-2");

    await sendPushNotification("device-token", "Title", "Body");

    expect(send).toHaveBeenCalledWith(
      expect.not.objectContaining({
        data: expect.anything(),
      }),
    );
  });

  test("skips cleanly when the token is missing", async () => {
    const result = await sendPushNotification("", "Title", "Body", "tag");

    expect(result).toEqual({
      status: "skipped",
      reason: "missing-fcm-token",
    });
    expect(send).not.toHaveBeenCalled();
  });

  test("returns failed status and logs when firebase send rejects", async () => {
    send.mockRejectedValue({
      code: "messaging/internal-error",
      message: "FCM failed",
    });

    const result = await sendPushNotification("device-token", "Title", "Body", "exam", "exam-1");

    expect(result).toEqual({
      status: "failed",
      reason: "messaging/internal-error",
      message: "FCM failed",
    });
    expect(loggerError).toHaveBeenCalledWith(
      "Failed to send push notification",
      expect.objectContaining({
        route: "exam",
        hasToken: true,
      }),
      expect.objectContaining({
        code: "messaging/internal-error",
      }),
    );
  });
});
