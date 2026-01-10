import crypto from "crypto";
import { config } from "../../config/config.js";


export async function zohoPaymentWebhookAuthenticate(req, res, next) {
  try {
    const WEBHOOK_SECRET = config.zohoWebhookAuthSecret;
    const signatureHeader = req.headers["x-zoho-webhook-signature"];

    if (!signatureHeader) {
      return res.status(400).send("Missing signature");
    }

    const { timestamp, signature } = parseZohoSignature(signatureHeader);
    const expected = computeSignature(timestamp, req.rawBody, WEBHOOK_SECRET);

    if (expected !== signature) {
      console.log("Webhook signature mismatch");
      return res.status(401).send("Invalid signature");
    }
    console.log("Webhook signature verified");
    next();
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
}

export async function zohoRefundWebhookAuthenticate(req, res, next) {
  try {
    const WEBHOOK_SECRET = config.zohoWebhookRefundAuthSecret;
    const signatureHeader = req.headers["x-zoho-webhook-signature"];

    if (!signatureHeader) {
      return res.status(400).send("Missing signature");
    }

    const { timestamp, signature } = parseZohoSignature(signatureHeader);
    const expected = computeSignature(timestamp, req.rawBody, WEBHOOK_SECRET);

    if (expected !== signature) {
      console.log("Webhook signature mismatch");
      return res.status(401).send("Invalid signature");
    }
    console.log("Webhook signature verified");
    next();
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
}

function parseZohoSignature(header) {
  const parts = header.split(",");
  return {
    timestamp: parts[0].split("=")[1],
    signature: parts[1].split("=")[1],
  };
}

function computeSignature(timestamp, rawBody, secret) {
  const payload = `${timestamp}.${rawBody}`;
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}
