import { GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { secretsManagerClient } from "./aws.config.js";
import { secretsCache } from "./secrets.cache.js";

/**
 * @typedef {object} ZohoCredentials
 * @property {string} clientId
 * @property {string} clientSecret
 * @property {string} refreshToken
 * @property {string} [accountId]
 * @property {string} [webhookSecret]
 */

/**
 * Fetches, parses, validates, and caches Zoho OAuth credentials from AWS Secrets Manager.
 *
 * @param {string} secretId - The ID or ARN of the secret in AWS Secrets Manager.
 * @returns {Promise<ZohoCredentials>} The validated and formatted Zoho credentials.
 * @throws {Error} Throws a generic error if credentials cannot be retrieved or are invalid.
 */
export async function getZohoCredentials(secretId) {
  // 1. Check cache first
  const cachedCredentials = secretsCache.get(secretId);
  if (cachedCredentials) {
    console.debug("Returning cached credentials.", { secretId });
    return cachedCredentials;
  }

  console.info("Fetching new credentials from AWS Secrets Manager.", {
    secretId
  });

  try {
    // 2. Fetch from AWS
    const command = new GetSecretValueCommand({ SecretId: secretId });
    const response = await secretsManagerClient.send(command);

    if (!response.SecretString) {
      throw new Error("SecretString from AWS is empty.");
    }

    // 3. Parse and Validate
    const rawSecret = JSON.parse(response.SecretString);

    const {
      clientId: clientId,
      clientSecret: clientSecret,
      refreshToken: refreshToken,
      accountId: accountId,
      webhookSecret: webhookSecret
    } = rawSecret;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error(
        "Secret is missing one or more required fields (client_id, client_secret, refresh_token)."
      );
    }

    const credentials = {
      clientId,
      clientSecret,
      refreshToken,
      accountId,
      webhookSecret
    };

    // 4. Cache the result
    secretsCache.set(secretId, credentials);

    return credentials;
  } catch (error) {
    // 5. Log securely and throw a generic error
    console.error(
      "Failed to retrieve or parse secret from AWS Secrets Manager.",
      {
        secretId, // Safe to log
        errorName: error.name, // e.g., ResourceNotFoundException
        errorMessage: error.message // Contains context but not the secret value
      }
    );

    // Do not expose detailed AWS errors to the caller.
    throw new Error("Could not retrieve payment gateway credentials.");
  }
}
