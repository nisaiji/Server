import { config } from "./config.js";
import Twilio from "twilio";

const accountSid = config.twilioAccountSID;
const authToken = config.twilioAuthToken;
const fromPhoneNumber = config.twilioPhoneNumber;

export async function sentSMSByTwillio(toPhoneNumber, message) {
  try {
    const client = Twilio(accountSid, authToken);
    const response = await client.messages.create({
      body: message,
      from: fromPhoneNumber,
      to: toPhoneNumber,
    });
    return response;
  } catch (error) {
    throw error;
  }
}
