import axios from "axios";
import { config } from "../config/config.js";

const url =config?.msg91Url;
export async function verifyMsg91Token(accessToken) {
  try {
    const response = await axios.post(url, {
      "access-token": accessToken,
      authkey: config?.msg91AuthKey
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response?.data;
  } catch (error) {
    console.error('Error verifying access token:', error.response?.data || error.message);
    throw error;
  }
}
