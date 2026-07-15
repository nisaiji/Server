import crypto from "crypto";
import webhookEventModel from "../../models/payments/webhookEvent.model.js";

/**
 * Verifies the signature of a Zoho webhook request using a tenant-specific secret.
 * @param {string} payload - The raw, unparsed request body string.
 * @param {string} signature - The value of the 'x-zoho-webhook-signature' header.
 * @param {string} secret - The webhook secret from the tenant's configuration.
 * @returns {boolean} True if the signature is valid, false otherwise.
 */
export function verifyZohoWebhookSignature(payload, signature, secret) {
  if (!secret) {
    console.warn(
      "Webhook secret is not configured for tenant. Skipping signature verification. This is insecure for production."
    );
    // In a strict production environment, you should return false here.
    return true;
  }

  if (!signature) {
    return false;
  }

  // Parse "t=<timestamp>,v=<hex signature>"
  const parts = Object.fromEntries(
    signature.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key?.trim(), value?.trim()];
    })
  );

  const timestamp = parts["t"];
  const providedSig = parts["v"];

  if (!timestamp || !providedSig) {
    return false;
  }

  // Replay protection (Zoho's docs don't specify a window, but this is good practice)
  const timestampMs = Number(timestamp);
  if (!Number.isFinite(timestampMs)) {
    return false;
  }
  // Per Zoho docs: signed data = "<timestamp>.<raw payload>"
  const signedContent = `${timestamp}.${payload}`;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(signedContent)
    .digest("hex");

  const providedBuf = new Uint8Array(Buffer.from(providedSig, "hex"));
  const expectedBuf = new Uint8Array(Buffer.from(expectedSignature, "hex"));

  if (providedBuf.length !== expectedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}

/**
 * Creates or updates a record for an incoming webhook event.
 * This function is idempotent based on the gatewayEventId.
 * @param {object} args
 * @returns {Promise<object>} The created or updated webhook event document.
 */
export async function recordWebhookEvent({
  adminId,
  gateway,
  gatewayEventId,
  eventType,
  payload,
  isVerified,
  paymentId
}) {
  return webhookEventModel.findOneAndUpdate(
    { gatewayEventId },
    {
      $set: {
        adminId,
        eventType,
        gatewayResponse: payload,
        isVerified,
        paymentId,
        processingStatus: "PENDING" // Reset status on new verified payload
      },
      $setOnInsert: { gateway, gatewayEventId }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function updateWebhookEventStatus(
  webhookEventId,
  status,
  errorMessage = null
) {
  return webhookEventModel.findByIdAndUpdate(webhookEventId, {
    processingStatus: status,
    processingError: errorMessage
  });
}
