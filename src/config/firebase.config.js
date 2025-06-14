import admin from "firebase-admin";
// import serviceAccount from "../../sharedri-firebase-adminsdk-fbsvc-8f948b3654.json" assert { type: "json" };
import serviceAccount from "../../nikhilesh-firebase.json" assert { type: "json" };

const imageUrl = "http://localhost:4000/images/logo.jpeg";
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export async function sendPushNotification(fcmToken, title, body) {
  try {
  if(!fcmToken) {
    return;
  }
  const message = {
    notification: {
      title,
      body,
      image: imageUrl
    },
    token: fcmToken,
  };
  const response = await admin.messaging().send(message);
  return response;
  } catch (error) {
    throw error;
  }
}
