import { getAdminService } from "../../services/admin.services.js";
import { error, success } from "../../utills/responseWrapper.js";
import { config } from "../../config/config.js";
import { ZOHO_PAYMENT_SANDBOX_SCOPES, ZOHO_PAYMENT_SCOPES } from "../../constants/zohoPayment.constants.js";
import { getMarchantPaymentConfigService, updateMarchantPaymentConfigService } from "../../services/marchantPaymentConfig.service.js";
import { getTokenService, refreshTokenService, revokeRefreshTokenService } from "../../services/zohoPayment.service.js";
import { StatusCodes } from "http-status-codes";

export async function paymentAuthController(req, res) {
  try {
    const { schoolId } = req.params;
    const isSandBox = req.query.sandbox === 'true';
    const { zohoAccountUrl, zohoRedirectUrl } = config;

    const school = await getAdminService({ _id: schoolId });
    let schoolMarchant = await getMarchantPaymentConfigService({ school: schoolId });
    if (!school) {
      return res.status(404).send(error(404, "School not found"));
    }
    if (!schoolMarchant) {
      return res.status(404).send(error(404, "Marchant Account not found"));
    }
    const scopes = isSandBox ? ZOHO_PAYMENT_SANDBOX_SCOPES : ZOHO_PAYMENT_SCOPES;
    const soid = isSandBox ? `zohopaysandbox.${schoolMarchant.zohoAccountId}` : `zohopay.${schoolMarchant.zohoAccountId}`;

    const url = new URL("/oauth/v2/auth", zohoAccountUrl);

    url.searchParams.set("scope", scopes);
    url.searchParams.set("client_id", schoolMarchant.zohoClientId);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("redirect_uri", zohoRedirectUrl);
    url.searchParams.set("prompt", "consent");
    url.searchParams.set("soid", soid);

    const authUrl = url.toString();

    return res.redirect(authUrl);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function paymentTokenController(req, res) {
  try {
    const { code, isSandbox } = req.body;
    const schoolId = req.adminId;
    const school = await getAdminService({ _id: schoolId, isActive: true });
    let schoolMarchant = await getMarchantPaymentConfigService({ school: schoolId });
    if (!school) {
      return res.status(404).send(error(404, "School not found"));
    }
    if (!schoolMarchant) {
      return res.status(404).send(error(404, "Marchant Account not found"));
    }
    const response = await getTokenService({
      code,
      clientId: schoolMarchant.zohoClientId,
      clientSecret: schoolMarchant.zohoClientSecret,
      redirectUri: isSandbox ? config.zohoSandboxRedirectUrl : config.zohoRedirectUrl,
      soid: isSandbox ? `zohopaysandbox.${schoolMarchant.zohoAccountId}` : `zohopay.${schoolMarchant.zohoAccountId}`,
      isSandbox
    });
    console.log("Zoho Token Response:", response);
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + parseInt(response.expires_in, 10));
    await updateMarchantPaymentConfigService(
      { _id: schoolMarchant._id },
      {
        accessTokenExpiresAt: expiresAt,
        accessTokenScopes: response.scope ? response.scope.split(" ") : [],
        zohoAccessToken: response.access_token,
        zohoRefreshToken: response.refresh_token
      }
    );

    return res.status(200).send(success(200, response));
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
}

export async function paymentRefreshTokenController(req, res) {
  try {
    const schoolId = req.adminId;
    const school = await getAdminService({ _id: schoolId, isActive: true });
    let schoolMarchant = await getMarchantPaymentConfigService({ school: schoolId });
    if (!school) {
      return res.status(404).send(error(404, "School not found"));
    }
    if (!schoolMarchant) {
      return res.status(404).send(error(404, "Marchant Account not found"));
    }
    if (!schoolMarchant.zohoAccessToken && !schoolMarchant.accessTokenExpiresAt && !schoolMarchant.accessTokenExpiresAt) {
      return res.status(400).send(error(400, "Invalid request"));
    }

    const response = await refreshTokenService({
      refreshToken: schoolMarchant.zohoRefreshToken,
      clientId: schoolMarchant.zohoClientId,
      clientSecret: schoolMarchant.zohoClientSecret
    });

    console.log("Zoho Token Response:", response);
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + parseInt(response.expires_in, 10));
    await updateMarchantPaymentConfigService(
      { _id: schoolMarchant._id },
      {
        accessTokenExpiresAt: expiresAt,
        accessTokenScopes: response.scope ? response.scope.split(" ") : [],
        zohoAccessToken: response.access_token,
      }
    );

    return res.status(200).send(success(200, response));
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
}

export async function paymentRevokeRefreshTokenController(req, res) {
  try {
    const { refreshToken } = req.body;
    const schoolId = req.adminId;
    const school = await getAdminService({ _id: schoolId, isActive: true });
    let schoolMarchant = await getMarchantPaymentConfigService({ school: schoolId });
    if (!school) {
      return res.status(404).send(error(404, "School not found"));
    }
    if (!schoolMarchant) {
      return res.status(404).send(error(404, "Marchant Account not found"));
    }
    // if (refreshToken !== schoolMarchant.zohoRefreshToken) {
    //   return res.status(400).send(error(400, "Invalid request"));
    // }
    const response = await revokeRefreshTokenService({ refreshToken });
    if (schoolMarchant.zohoRefreshToken === refreshToken) {
      await updateMarchantPaymentConfigService(
        { _id: schoolMarchant._id },
        {
          accessTokenExpiresAt: null,
          accessTokenScopes: [],
          zohoAccessToken: null,
          zohoRefreshToken: null
        }
      );
    }
    return res.status(200).send(success(200, response));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: err.message });
  }
}