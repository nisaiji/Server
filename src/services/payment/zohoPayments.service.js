import axios from "axios";
import { config } from "../../config/config.js";

/**
 * A generic Zoho API request helper.
 * @param {object} args
 * @param {string} args.accessToken - The Zoho OAuth access token.
 * @param {string} args.method - HTTP method.
 * @param {string} args.endpoint - API endpoint path (e.g., 'paymentsessions').
 * @param {object} [args.data] - Request body data.
 * @param {object} [args.params] - URL query parameters.
 * @returns {Promise<any>} The response data from Zoho.
 */
async function zohoRequest({
  accessToken,
  method,
  endpoint,
  data = null,
  params = null
}) {
  const baseUrl = config.isSandbox
    ? config.zohoPaySandBoxUrl
    : config.zohoPayUrl;

  try {
    const response = await axios({
      method,
      url: `${baseUrl}/api/v1/${endpoint}`,
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json"
      },
      ...(params && { params }),
      ...(data && { data })
    });
    return response.data;
  } catch (error) {
    console.error("Zoho API request failed.", {
      endpoint,
      method,
      zohoError: error.response?.data,
      errorMessage: error.message
    });
    throw new Error(
      `Payment gateway API error: ${error.response?.data?.message || "Request failed"}`
    );
  }
}

/**
 * Creates a payment session with Zoho Payments.
 * @param {object} args
 * @param {string} args.accessToken
 * @param {number} args.amount
 * @param {string} args.currency
 * @param {string} args.description
 * @param {string} args.accountId
 * @param {string} args.internalPaymentId
 * @returns {Promise<any>}
 */
export async function createZohoPaymentSession({
  accessToken,
  amount,
  currency = "INR",
  description,
  accountId,
  internalPaymentId
}) {
  return zohoRequest({
    accessToken,
    method: "post",
    endpoint: "paymentsessions",
    data: {
      amount,
      currency,
      description,
      meta_data: [
        {
          key: "paymentId",
          value: internalPaymentId
        }
      ]
    },
    params: {
      account_id: accountId
    }
  });
}

/**
 * Creates a webhook subscription with Zoho Payments.
 * @param {object} args
 * @param {string} args.accessToken
 * @param {string} args.accountId
 * @param {object} args.webhookData - The webhook configuration data (e.g., { url, events }).
 * @returns {Promise<any>}
 */
export async function createZohoWebhook({
  accessToken,
  accountId,
  webhookData
}) {
  return zohoRequest({
    accessToken,
    method: "post",
    endpoint: "webhooks",
    data: webhookData,
    params: {
      account_id: accountId
    }
  });
}

/**
 * Fetches payment details from Zoho.
 * @param {object} args
 * @param {string} args.accessToken
 * @param {string} args.gatewayPaymentId
 * @returns {Promise<any>}
 */
export async function fetchZohoPayment({ accessToken, gatewayPaymentId }) {
  return zohoRequest({
    accessToken,
    method: "get",
    endpoint: `payments/${gatewayPaymentId}`
  });
}
