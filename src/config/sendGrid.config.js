import sendGrid from "@sendgrid/mail";
import { config } from "./config.js";

sendGrid.setApiKey(config.sendGridApiKey);

export async function sendEmailBySendGrid({
  fromEmail,
  toEmail,
  subject,
  html,
}) {
  try {
    const msg = {
      to: toEmail,
      from: fromEmail,
      subject: subject,
      html: html,
    };

    const res = await sendGrid.send(msg);
    console.log(res);
    return res;
  } catch (error) {
    throw error;
  }
}

export async function sendEmailService(toEmail, msg) {
  const response = await sendEmailBySendGrid({
    fromEmail: config.sendGridEmail,
    toEmail,
    subject: "Email Verification",
    html: msg,
  });
  return response;
}
