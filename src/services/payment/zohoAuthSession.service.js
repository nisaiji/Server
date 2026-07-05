import zohoAuthSessionModel from "../../models/payments/zohoAuthSession.model.js";

export async function createZohoAuthSessionService(data) {
  const { schoolId, accessToken, paymentSecretKey, expiresAt } = data;
  return zohoAuthSessionModel.create({
    schoolId,
    accessToken,
    paymentSecretKey,
    expiresAt
  });
}

export async function getZohoAuthSessionService(schoolId) {
  return zohoAuthSessionModel.findOne({ schoolId });
}
