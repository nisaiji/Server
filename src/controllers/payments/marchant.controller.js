import { StatusCodes } from "http-status-codes";
import { createMarchantPaymentConfigService, getMarchantPaymentConfigService, updateMarchantPaymentConfigService } from "../../services/marchantPaymentConfig.service.js";

export async function createOrUpdateMarchantController(req, res) {
  try {
    const { schoolId, zohoClientId, zohoClientSecret, zohoAccountId } = req.body;
    const adminId = req.adminId;
    const marchant = await getMarchantPaymentConfigService({ school: schoolId });
    if (!marchant) {
      await createMarchantPaymentConfigService({ school: schoolId, zohoClientId, zohoClientSecret, zohoAccountId });
      return res.status(StatusCodes.OK).json({ message: "Marchant payment config created successfully" });
    }

    const params = {};
    if(zohoClientId) params.zohoClientId = zohoClientId;
    if(zohoClientSecret) params.zohoClientSecret = zohoClientSecret;
    if(zohoAccountId) params.zohoAccountId = zohoAccountId;

    await updateMarchantPaymentConfigService({_id: marchant['_id']}, params);
    return res.status(StatusCodes.OK).json({ message: "Marchant payment config updated successfully" });
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: err.message });
  }
}