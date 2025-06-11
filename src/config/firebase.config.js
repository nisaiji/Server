import admin from "firebase-admin";
// import serviceAccount from "../../sharedri-firebase-adminsdk-fbsvc-8f948b3654.json" assert { type: "json" };
import serviceAccount from "../../nikhilesh-firebase.json" assert { type: "json" };


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export async function sendPushNotification(fcmToken, title, body) {
  const message = {
    notification: {
      title,
      body,
    },
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    throw error;
  }
}
