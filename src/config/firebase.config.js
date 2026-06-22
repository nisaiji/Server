import admin from "firebase-admin";

import serviceAccount from "../../firebase.json" with { type: "json" };
import logger from "../logger/index.js";

const imageUrl = "http://localhost:4000/images/logo.jpeg";

if (!admin.apps?.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

function buildNotificationData(route, id) {
  const data = {};

  if (route !== undefined && route !== null) {
    data.route = String(route);
  }

  if (id !== undefined && id !== null) {
    data.id = String(id);
  }

  return data;
}

export async function sendPushNotification(fcmToken, title, body, route, id) {
  try {
    if (!fcmToken) {
      return {
        status: "skipped",
        reason: "missing-fcm-token"
      };
    }

    const data = buildNotificationData(route, id);
    const message = {
      notification: {
        title,
        body,
        imageUrl
      },
      token: fcmToken,
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "default"
        }
      },
      apns: {
        payload: {
          aps: {
            sound: "default"
          }
        }
      }
    };

    if (Object.keys(data).length) {
      message.data = data;
    }

    const response = await admin.messaging().send(message);
    return {
      status: "sent",
      messageId: response
    };
  } catch (error) {
    logger.error(
      "Failed to send push notification",
      {
        route: route ?? null,
        hasToken: Boolean(fcmToken),
        tokenSuffix: typeof fcmToken === "string" ? fcmToken.slice(-6) : null
      },
      error
    );

    return {
      status: "failed",
      reason: error.code ?? "unknown-error",
      message: error.message
    };
  }
}
