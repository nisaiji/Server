import { createRequire } from "module";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import logger from "../logger/index.js";
const require = createRequire(import.meta.url);
const serviceAccount = require("../../firebase.json");

const imageUrl = "http://localhost:4000/images/logo.jpeg";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key
    })
  });
}

function buildNotificationData(route, id, type) {
  const data = {};
  if (type) data.type = String(type);
  if (route !== undefined && route !== null) {
    data.route = String(route);
  }

  if (id !== undefined && id !== null) {
    data.id = String(id);
  }

  return data;
}

export async function sendPushNotification(
  fcmToken,
  title,
  body,
  route,
  id,
  type
) {
  try {
    if (!fcmToken) {
      return {
        status: "skipped",
        reason: "missing-fcm-token"
      };
    }

    const data = buildNotificationData(route, id, type);
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

    const response = await getMessaging().send(message);
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
