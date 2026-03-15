import { StatusCodes } from "http-status-codes";
import { createMarchantPaymentConfigService, getMarchantPaymentConfigService, updateMarchantPaymentConfigService } from "../../services/marchantPaymentConfig.service.js";
import { getAdminService, updateAdminService } from "../../services/admin.services.js";

export async function createOrUpdateMarchantController(req, res) {
  try {
    const { schoolId, zohoClientId, zohoClientSecret, zohoAccountId, accessToken, refreshToken, tokenExpiresAt } = req.body;
    const school = await getAdminService({ _id: schoolId });
    if (!school) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid school" });
    let marchant = await getMarchantPaymentConfigService({ school: schoolId });
    if (!marchant) {
      marchant = await createMarchantPaymentConfigService({ school: schoolId, zohoClientId, zohoClientSecret, zohoAccountId, zohoAccessToken: accessToken, zohoRefreshToken: refreshToken, accessTokenExpiresAt: tokenExpiresAt });
      await updateAdminService({ _id: schoolId }, { marchantPaymentConfig: marchant['_id'] });
      return res.status(StatusCodes.OK).json({ message: "Marchant payment config created successfully" });
    }

    const params = {};
    if(zohoClientId) params.zohoClientId = zohoClientId;
    if(zohoClientSecret) params.zohoClientSecret = zohoClientSecret;
    if(zohoAccountId) params.zohoAccountId = zohoAccountId;
    if(accessToken) params.zohoAccessToken = accessToken;
    if(refreshToken) params.zohoRefreshToken = refreshToken;
    if(tokenExpiresAt) params.accessTokenExpiresAt = tokenExpiresAt;

    await updateMarchantPaymentConfigService({_id: marchant['_id']}, params);
    return res.status(StatusCodes.OK).json({ message: "Marchant payment config updated successfully" });
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: err.message });
  }
}