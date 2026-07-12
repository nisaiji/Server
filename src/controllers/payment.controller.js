import { StatusCodes } from "http-status-codes";
import {
  getZohoCredentials,
  updateZohoCredentials
} from "../config/aws/secrets.service.js";
import { config } from "../config/config.js";
import { getParentService } from "../services/parent.services.js";
import { getAccessToken } from "../services/payment/oauth.service.js";
import {
  getPaymentService,
  getPaymentsService,
  getReceiptByPaymentIdService,
  getReceiptByReceiptNoService,
  initiatePaymentFlow,
  processFailedPayment,
  processSuccessfulPayment
} from "../services/payment/payment.service.js";
import { verifyZohoWebhookSignature } from "../services/payment/webhook.service.js";
import {
  getZohoAuthSessionService,
  updateZohoAuthSessionService
} from "../services/payment/zohoAuthSession.service.js";
import { createZohoWebhook } from "../services/payment/zohoPayments.service.js";
import { getSessionStudentService } from "../services/sessionStudent.service.js";
import { error, success } from "../utils/responseWrapper.js";
//checked
async function assertParentOwnsSessionStudent(parentId, sessionStudent) {
  const parent = await getParentService({ _id: parentId });
  if (!parent) {
    return {
      ok: false,
      statusCode: StatusCodes.NOT_FOUND,
      message: "Parent not found"
    };
  }

  const ownsStudent = parent.students?.some((id) =>
    id.equals(sessionStudent.student)
  );
  if (!ownsStudent) {
    return {
      ok: false,
      statusCode: StatusCodes.FORBIDDEN,
      message: "Unauthorized access to student"
    };
  }

  return { ok: true, parent };
}
//checked
function resolveWebhookStatus(payload) {
  const status = (payload?.event_object?.payment?.status ?? "FAILED")
    .toString()
    .toUpperCase();

  if (["SUCCESS", "SUCCEEDED", "PAID", "COMPLETED"].includes(status)) {
    return "SUCCESS";
  }

  if (["FAILED", "FAILURE", "CANCELLED", "CANCELED"].includes(status)) {
    return "FAILED";
  }

  return null;
}
//checked
function resolveWebhookPaymentId(payload) {
  return payload?.event_object?.payment?.payments_session_id ?? null;
}
//checked
function resolveWebhookInternalPaymentId(payload) {
  const metadata = Array.isArray(payload?.event_object?.payment?.meta_data)
    ? payload.event_object.payment.meta_data
    : [];
  const paymentIdEntry = metadata.find((item) => item?.key === "paymentId");

  return paymentIdEntry?.value ?? null;
}

//checked
export async function initiatePaymentController(req, res) {
  try {
    const { sessionStudentId, feeDueIds } = req.body;
    const { parentId } = req;

    console.info("Payment initiation request received.", {
      parentId,
      sessionStudentId,
      feeDueIds: feeDueIds.length
    });

    // The controller's job is to gather inputs and call the service layer.
    // The service layer handles the business logic and orchestration.
    const result = await initiatePaymentFlow({
      sessionStudentId,
      feeDueIds,
      parentId
    });

    console.info("Payment session created successfully.", {
      paymentId: result.paymentId
    });
    return res.status(StatusCodes.OK).send(success(200, result));
  } catch (err) {
    const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    console.error("Error during payment initiation.", {
      error: err.message,
      statusCode,
      stack: err.stack
    });
    return res.status(statusCode).send(error(statusCode, err.message));
  }
}

export async function getPaymentController(req, res) {
  try {
    const { paymentId } = req.params;
    const parentId = req.parentId;

    const payment = await getPaymentService({ _id: paymentId });
    if (!payment) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(error(404, "Payment not found"));
    }

    const sessionStudent = await getSessionStudentService({
      _id: payment.sessionStudentId
    });
    if (!sessionStudent) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(error(404, "Session student not found"));
    }

    const ownership = await assertParentOwnsSessionStudent(
      parentId,
      sessionStudent
    );
    if (!ownership.ok) {
      return res
        .status(ownership.statusCode)
        .send(error(ownership.statusCode, ownership.message));
    }

    return res.status(StatusCodes.OK).send(success(200, { payment }));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function getPaymentHistoryController(req, res) {
  try {
    const { sessionStudentId } = req.params;
    const parentId = req.parentId;

    const sessionStudent = await getSessionStudentService({
      _id: sessionStudentId
    });
    if (!sessionStudent) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(error(404, "Session student not found"));
    }

    const ownership = await assertParentOwnsSessionStudent(
      parentId,
      sessionStudent
    );
    if (!ownership.ok) {
      return res
        .status(ownership.statusCode)
        .send(error(ownership.statusCode, ownership.message));
    }

    const payments = await getPaymentsService({ sessionStudentId });
    return res.status(StatusCodes.OK).send(success(200, { payments }));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function getReceiptController(req, res) {
  try {
    const { paymentId } = req.params;
    const parentId = req.parentId;

    const payment = await getPaymentService({
      _id: paymentId,
      status: "SUCCESS"
    });
    if (!payment) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(error(404, "Successful payment not found"));
    }

    const sessionStudent = await getSessionStudentService({
      _id: payment.sessionStudentId
    });
    const ownership = await assertParentOwnsSessionStudent(
      parentId,
      sessionStudent
    );
    if (!ownership.ok) {
      return res
        .status(ownership.statusCode)
        .send(error(ownership.statusCode, ownership.message));
    }

    const receipt = await getReceiptByPaymentIdService(paymentId);
    if (!receipt) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(error(404, "Receipt not found"));
    }

    return res.status(StatusCodes.OK).send(success(200, { receipt, payment }));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function getAdminPaymentHistoryController(req, res) {
  try {
    const { sessionStudentId } = req.params;
    const adminId = req.adminId;

    const sessionStudent = await getSessionStudentService({
      _id: sessionStudentId,
      school: adminId
    });

    if (!sessionStudent) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(error(404, "Session student not found"));
    }

    const payments = await getPaymentsService({ sessionStudentId, adminId });
    return res.status(StatusCodes.OK).send(success(200, { payments }));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function getAdminReceiptController(req, res) {
  try {
    const { receiptNo } = req.params;
    const adminId = req.adminId;

    const receipt = await getReceiptByReceiptNoService(receiptNo, adminId);
    if (!receipt) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(error(404, "Receipt not found"));
    }

    const payment = await getPaymentService({
      _id: receipt.paymentId,
      adminId
    });
    return res.status(StatusCodes.OK).send(success(200, { receipt, payment }));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function zohoWebhookController(req, res) {
  try {
    console.log("headers", req.headers);
    const signature =
      req.headers["x-zoho-signature"] ||
      req.headers["x-zoho-webhook-signature"];
    const rawPayload = JSON.stringify(req.body);

    const payload = req.body;
    const paymentSessionId = resolveWebhookPaymentId(payload);
    const internalPaymentId = resolveWebhookInternalPaymentId(payload);
    const webhookStatus = resolveWebhookStatus(payload);

    let payment = null;
    if (internalPaymentId) {
      console.info("Processing Zoho webhook with internal payment ID.", {
        internalPaymentId,
        webhookStatus
      });
      payment = await getPaymentService({ _id: internalPaymentId });
    }
    if (!payment && paymentSessionId) {
      console.info("Processing Zoho webhook with gateway payment session ID.", {
        paymentSessionId,
        webhookStatus
      });
      payment = await getPaymentService({ paymentSessionId });
    }

    if (!payment) {
      console.error("Webhook received for an unknown payment.", {
        internalPaymentId,
        paymentSessionId,
        payload
      });
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(error(404, "Payment not found for webhook"));
    }

    // Tenant-aware signature verification
    const schoolId = payment.adminId;
    const paymentSettings = await getZohoAuthSessionService({ schoolId });
    if (!paymentSettings?.paymentSecretKey) {
      console.error("Webhook received for a school with no payment settings.", {
        schoolId,
        paymentId: payment._id
      });
      return res
        .status(StatusCodes.SERVICE_UNAVAILABLE)
        .send(error(503, "Payment gateway not configured for this school."));
    }
    const credentials = await getZohoCredentials(
      paymentSettings.paymentSecretKey
    );
    const webhookSecret = credentials?.webhookSecret;

    if (!verifyZohoWebhookSignature(rawPayload, signature, webhookSecret)) {
      console.warn("Invalid webhook signature received.", {
        paymentId: payment._id,
        schoolId
      });
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send(error(401, "Invalid webhook signature"));
    }

    if (webhookStatus === "SUCCESS") {
      await processSuccessfulPayment({
        payment,
        paymentSessionId: paymentSessionId,
        gatewayResponse: payload
      });
    } else if (webhookStatus === "FAILED") {
      await processFailedPayment({
        payment,
        paymentSessionId: paymentSessionId,
        gatewayResponse: payload
      });
    }

    return res.status(StatusCodes.OK).send(success(200, { received: true }));
  } catch (err) {
    console.error("Error processing Zoho webhook.", {
      error: err.message,
      stack: err.stack
    });
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function paymentCallbackController(req, res) {
  try {
    const { paymentId } = req.query;

    if (!paymentId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(error(400, "paymentId is required"));
    }

    const payment = await getPaymentService({ _id: paymentId });
    if (!payment) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(error(404, "Payment not found"));
    }

    return res.status(StatusCodes.OK).send(
      success(200, {
        paymentId: payment._id,
        status: payment.status,
        amount: payment.amount,
        paidAt: payment.paidAt
      })
    );
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

//checked
export async function setZohoSecretController(req, res) {
  try {
    const schoolId = req.adminId;

    // fetch the secret from AWS Secrets Manager
    const secretId = `${config.environment}/school/${schoolId}/payment`;
    const credentials = await getZohoCredentials(secretId);

    // create a new access token using the refresh token
    const { accessToken, expiresAt } = await getAccessToken({
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
      refreshToken: credentials.refreshToken,
      cacheKey: schoolId.toString()
    });

    // create zoho webhook
    const webhookData = await createZohoWebhook({
      accessToken,
      accountId: credentials.accountId,
      webhookData: {
        name: `${config.environment} Payment notifications`,
        url: config.zohoWebhookUrl,
        description:
          "Forwards payment and refund events to our order management system.",
        enabled_events: ["payment.succeeded", "payment.failed"]
      }
    });

    // update aws secretes with zoho webhook secret
    await updateZohoCredentials(secretId, {
      ...credentials,
      webhookSecret: webhookData.webhook_url.signing_key
    });

    await updateZohoAuthSessionService(schoolId, {
      paymentSecretKey: secretId,
      accessToken,
      expiresAt: new Date(Date.now() + (expiresAt - Date.now())),
      accountId: credentials.accountId,
      zohoWebhookUrlId: webhookData.webhook_url.webhook_url_id
    });
    return res.status(StatusCodes.OK).send(success(200));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}
