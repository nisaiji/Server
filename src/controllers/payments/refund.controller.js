import { StatusCodes } from "http-status-codes";
import { error, success } from "../../utills/responseWrapper.js";
import { createRefundApiService, refreshTokenService } from "../../services/zohoPayment.service.js";
import { getMarchantPaymentConfigService, updateMarchantPaymentConfigService } from "../../services/marchantPaymentConfig.service.js";
import { getPaymentTransactionService } from "../../services/paymentTransaction.service.js";
import { config } from "../../config/config.js";
import logger from "../../logger/index.js";
import { getSessionStudentService } from "../../services/v2/sessionStudent.service.js";
import { createRefundService } from "../../services/refund.services.js";

export async function createRefundController(req, res) {
  try {
    const {sessionStudentId, paymentId, amount, reason = "requested_by_customer", description } = req.body;
    const parentId = req.parentId;

    const sessionStudent = await getSessionStudentService({ _id: sessionStudentId});
    if(!sessionStudent) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Student not found"));
    }
    const payment = await getPaymentTransactionService({ zohoPaymentId: paymentId, status: "paid" });
    if (!payment) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Payment not found"));
    }

    let marchant = await getMarchantPaymentConfigService({ school: sessionStudent['school']});
    if (!marchant) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Merchant config not found"));
    }

    if (marchant.accessTokenExpiresAt < new Date()) {
      const response = await refreshTokenService({
        refreshToken: marchant.zohoRefreshToken,
        clientId: marchant.zohoClientId,
        clientSecret: marchant.zohoClientSecret
      });

      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + parseInt(response.expires_in, 10));
      await updateMarchantPaymentConfigService(
        { _id: marchant._id },
        {
          accessTokenExpiresAt: expiresAt,
          zohoAccessToken: response.access_token,
        }
      );
      marchant = await getMarchantPaymentConfigService({ _id: marchant._id });
    }

    const refundResponse = await createRefundApiService({
      paymentId,
      accountId: marchant.zohoAccountId,
      accessToken: marchant.zohoAccessToken,
      amount: 100,
      reason,
      type: "initiated_by_merchant",
      description,
      isSandbox: config.isSandbox
    });

    const refundInfo = refundResponse.refund;

    const refundData = {
      refundId: refundInfo.refund_id,
      paymentId: refundInfo.payment_id,
      referenceNumber: refundInfo.reference_number,
      amount: refundInfo.amount,
      type: refundInfo.type,
      reason: refundInfo.reason,
      description: refundInfo.description,
      status: refundInfo.status,
      networkReferenceNumber: refundInfo.network_reference_number,
      failureReason: refundInfo.failure_reason,
      refundDate: new Date(refundInfo.date * 1000),
      paymentTransaction: payment._id,
      feeInstallment: payment.feeInstallment,
      sessionStudent: sessionStudent._id,
      parent: parentId,
      student: sessionStudent.student,
      school: sessionStudent.school,
      session: sessionStudent.session
    }

    const refund = await createRefundService(refundData);

    console.log({refundResponse});

    return res.status(StatusCodes.OK).send(success(200, refundResponse));
  } catch (err) {
    logger.error("Error creating refund", {}, err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}
