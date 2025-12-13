import axios from "axios";
import {config} from "../config/config.js";
import { zohoCreatePaymentLinkPath, zohoCreatePaymentSessionPath, zohoRevokeRefreshTokenPath, zohoTokenPath } from "../constants/zohoPayment.constants.js";

const zohoPayUrl = config.zohoPayUrl;
const zohoSandBoxUrl = config.zohoPaySandBoxUrl;
const zohoAccountUrl = config.zohoAccountUrl;

export async function getTokenService({code, clientId, clientSecret, redirectUri, soid, isSandbox}) {
  const params = new URLSearchParams();
  params.append("code", code);
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("redirect_uri", redirectUri);
  params.append("grant_type", "authorization_code");
  params.append("soid", soid);

  try {
    const url = new URL(zohoTokenPath, zohoAccountUrl).toString();
    const response = await axios.post(url, params.toString(), {
          headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
  );

  if(response.data.error){
    throw new Error(response.data.error);
  }

  return response.data;
  } catch (error) {
    console.log("Error getting token:", error.response ? error.response.data : error.message);
    throw error;
 }
}

export async function refreshTokenService({ clientId, clientSecret, refreshToken}) {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("refresh_token", refreshToken);
  params.append("grant_type", "refresh_token");

  try {
    const url = new URL(zohoTokenPath, zohoAccountUrl).toString();
    const response = await axios.post(url, params.toString(), {
          headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
  );

  if(response.data.error){
    throw new Error(response.data.error);
  }
  return response.data;
  } catch (error) {
    console.log("Error refreshing token:", error.response ? error.response.data : error.message);
    throw error;
 }
}

export async function revokeRefreshTokenService({refreshToken}) {
  try {
    const url = new URL(zohoRevokeRefreshTokenPath, zohoAccountUrl);

    url.searchParams.append("token", refreshToken);
    const response = await axios.post(url.toString(), {
          headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
    console.log(`${refreshToken} revoked`);

    if(response.status !== 200){
      throw new Error("Failed to revoke token");
    }
    return response.data;
  } catch (error) {
    console.log("Error revoking token"); // error is big object
    throw new Error("Failed to revoke token");
  }
}


export async function createPaymentSessionApiService({accountId, amount, accessToken, currency, description, metaData, invoiceNumber, referenceNumber, isSandbox}) {
  const url = new URL(zohoCreatePaymentSessionPath, isSandbox ? zohoSandBoxUrl : zohoPayUrl);

  url.searchParams.append("account_id", accountId);

  const payload = {
    amount,
    currency,
    description,
    meta_data: metaData,
    invoice_number: invoiceNumber,
    reference_number: referenceNumber,
  }

  try {
      const response = await axios.post(url.toString(), payload, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}` 
          }
        }
      );
      return response.data;    
  } catch (error) {
    console.log({error})
    console.log('error in creating payment session');
    throw error;
  }
}

export async function createPaymentLinkApiService({accountId, accessToken, amount, currency, description, phone, email, referenceId, expiresAt, returnUrl, notifyUser, isSandbox}) {
  const url = new URL(zohoCreatePaymentLinkPath, isSandbox ? zohoSandBoxUrl : zohoPayUrl);
  url.searchParams.append("account_id", accountId);

  try {
    const payload = {
      amount,
      currency,
      email: "kuldeeppanwar460@gmail.com",
      description,
      phone,
      reference_id: referenceId,
      expires_at: expiresAt,
      notify_user: notifyUser,
      return_url: returnUrl
    }
    const response = await axios.post(url.toString(), payload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}` 
        }
    });

    return response.data;
  } catch (error) {
    console.log("Zoho Error:", error.response?.data || error.message);
    throw error;
  }
}
