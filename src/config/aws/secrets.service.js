import {
  GetSecretValueCommand,
  UpdateSecretCommand
} from "@aws-sdk/client-secrets-manager";
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

    if (
      !rawSecret.clientId ||
      !rawSecret.clientSecret ||
      !rawSecret.refreshToken
    ) {
      throw new Error(
        "Secret is missing one or more required fields (client_id, client_secret, refresh_token)."
      );
    }

    const credentials = {
      clientId: rawSecret.clientId,
      clientSecret: rawSecret.clientSecret,
      refreshToken: rawSecret.refreshToken,
      accountId: rawSecret.accountId,
      webhookSecret: rawSecret.webhookSecret
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

/**
 * Updates a secret in AWS Secrets Manager with new Zoho credentials.
 * After updating, it invalidates the cache to ensure fresh data is fetched on the next request.
 *
 * @param {string} secretId - The ID or ARN of the secret in AWS Secrets Manager.
 * @param {ZohoCredentials} credentials - The new Zoho credentials to store.
 * @returns {Promise<void>}
 * @throws {Error} Throws a generic error if the update fails.
 */
export async function updateZohoCredentials(secretId, credentials) {
  console.info("Updating secret in AWS Secrets Manager.", { secretId });

  // 2. Create the command to update the secret.
  const command = new UpdateSecretCommand({
    SecretId: secretId,
    SecretString: JSON.stringify(credentials, null, 2) // Pretty-print JSON
  });

  try {
    // 3. Send the command to AWS.
    await secretsManagerClient.send(command);

    // 4. Invalidate the cache for this secret to force a fresh read on next `get`.
    secretsCache.set(secretId, credentials);

    console.info("Successfully updated secret in AWS Secrets Manager.", {
      secretId
    });
  } catch (error) {
    console.error("Failed to update secret in AWS Secrets Manager.", {
      secretId,
      errorName: error.name,
      errorMessage: error.message
    });
    throw new Error("Could not update payment gateway credentials.");
  }
}
