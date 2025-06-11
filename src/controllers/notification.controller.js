import { StatusCodes } from "http-status-codes";
import { error, success } from "../utills/responseWrapper.js";
import { sendPushNotification } from "../config/firebase.config.js";

export async function sendNotificationByAdminController(req, res) {
  try {
    const tokenApp = "equ7rC57RXC7KBuT8hgCVl:APA91bHpKt5v2uWGCcLMx4G6FdqLyIlnzjjGnUmNQsAlgB20bwZXE8gul14l3y6yZtmqqMJmW2p9M0UHISNDa8A4OJaLo6dzEa-gr44CD7t0c473Vs-wDqQ";
    const tokenWeb = "ctqkoRzuGuc75bkgrAfdH_:APA91bHxmXCZoEI2E_bz0uw8LsK805jrVH9MbaBoSdJopXiv2wDQ45m0CMqWB4k7SRY35Z0N2be-GbRCu0fRQwjgFkfnIpHuOAk_zMLpK3z0rBR5F2NK3cA";
    const { title, description } = req.body;
    const res1 = await sendPushNotification(tokenApp, title, description);
    const res2 = await sendPushNotification(tokenWeb, title, description);
    return res.status(StatusCodes.OK).send(success(200, "Notification send successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}