import querystring from "querystring";
import axios from "axios";
import { config } from "../../config/config.js";

// In-memory cache for access tokens, keyed by a unique identifier (e.g., schoolId).
// For a distributed system, a shared cache like Redis would be more appropriate.
const tokenCache = new Map();

/**
 * @typedef {object} ZohoToken
 * @property {string} accessToken
 * @property {number} expiresAt - Timestamp in milliseconds.
 */

/**
 * Retrieves a Zoho access token for a given set of credentials, using a cache to avoid redundant requests.
 * @param {object} args
 * @param {string} args.clientId
 * @param {string} args.clientSecret
 * @param {string} args.refreshToken
 * @param {string} args.cacheKey - A unique key for caching, e.g., schoolId.
 * @returns {Promise<ZohoToken>}
 */
export async function getAccessToken({
  clientId,
  clientSecret,
  refreshToken,
  cacheKey
}) {
  const cached = tokenCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached;
  }

  try {
    const formData = querystring.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    });

    const response = await axios.post(
      `${config.zohoAccountUrl}/oauth/v2/token`,
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const tokenData = {
      accessToken: response.data.access_token,
      expiresAt: Date.now() + (response.data.expires_in - 60) * 1000 // 60-second buffer
    };

    tokenCache.set(cacheKey, tokenData);
    return tokenData;
  } catch (error) {
    console.error("Zoho token refresh failed.", {
      cacheKey,
      zohoError: error.response?.data,
      errorMessage: error.message
    });
    throw new Error("Failed to refresh payment gateway access token.");
  }
}
