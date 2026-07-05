import crypto from "crypto";

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

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Uint8Array.from(Buffer.from(signature)),
    Uint8Array.from(Buffer.from(expectedSignature))
  );
}
