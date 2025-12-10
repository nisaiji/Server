import { StatusCodes } from "http-status-codes";
import { error } from "../../utills/responseWrapper.js";
import { createPaymentLinkApiService, createPaymentSessionApiService, refreshTokenService } from "../../services/zohoPayment.service.js";
import { createPaymentSessionService } from "../../services/paymentSession.service.js";
import { getSessionStudentService } from "../../services/v2/sessionStudent.service.js";
import { config } from "../../config/config.js";
import { getMarchantPaymentConfigService, updateMarchantPaymentConfigService } from "../../services/marchantPaymentConfig.service.js";
import { getStudentService } from "../../services/student.service.js";
import { getAdminService } from "../../services/admin.services.js";
import { createPaymentTransactionService } from "../../services/paymentTransaction.service.js";
import { getParentService } from "../../services/v2/parent.services.js";

export async function createPaymentLinkController(req, res) {
  try {
    const { amount, sessionStudentId, description } = req.body;
    const parentId = req.parentId;
    const sessionStudent = await getSessionStudentService({_id: sessionStudentId});
    if(!sessionStudent) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Student not found"));
    }


    const [school, marchant, student, parent] = await Promise.all([
      getAdminService({_id: sessionStudent['school']}),
      getMarchantPaymentConfigService({school: sessionStudent['school']}),
      getStudentService({_id: sessionStudent['student']}),
      getParentService({_id: parentId})
    ]);

    if(!school || !marchant) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "School not found"));
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 15);

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
          accessTokenScopes: response.scope ? response.scope.split(" ") : [],
          zohoAccessToken: response.access_token,
        }
      );
    }

    const paymentLinkResponse = await createPaymentLink({
      amount, 
      currency: config.currency,
      accountId: marchant.zohoAccountId,
      sessionStudentId: sessionStudent['_id'],
      studentId: sessionStudent['student'],
      parentId: parentId,
      description: `payment for ${student.firstname}`,
      accessToken: marchant.zohoAccessToken,
      isSandbox: config.isSandbox,
      sectionId: sessionStudent.section,
      classId: sessionStudent.classId,
      sessionId: sessionStudent.session,
      schoolId: sessionStudent.school,
      phone: parent.phone,
      email: parent.email,
      referenceNumber: generateReferenceNumber({sessionStudentId: sessionStudent['_id']}),
      expiresAt: "2025-12-30",
      notifyUser: true,
      returnUrl: config.zohoRedirectUrl
    })
    return res.status(StatusCodes.OK).json(paymentLinkResponse);
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function createPaymentSession({ amount, currency, accountId, description, sessionStudentId, parentId, studentId,accessToken, isSandbox, sectionId, classId, sessionId, schoolId }) {
  try {
    const referenceNumber = generateReferenceNumber({ sessionStudentId });
    const invoiceNumber = generateInvoiceNumber({ sessionStudentId });
    const metaData = [
      {"key": "type", "value": "sessionStudent"},
      {"key": "id", "value": sessionStudentId.toString()}
    ]
    const response = await createPaymentSessionApiService({ amount, currency, accountId, metaData, description, accessToken, invoiceNumber, referenceNumber, isSandbox });
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 15);
    const params = {
      paymentSessionId: response?.payments_session?.payments_session_id,
      amount: amount,
      currency: currency,
      invoiceNumber: invoiceNumber,
      referenceNumber: referenceNumber,
      status: 'paymentSessionCreated',
      sessionStudent: sessionStudentId,
      student: studentId,
      section: sectionId,
      classId: classId,
      session: sessionId,
      parent: parentId,
      school: schoolId,
      validTill: expiryDate
    }
    
    const paymentSession = await createPaymentSessionService(params);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function createPaymentLink({amount, currency, accountId, description, phone, email, referenceNumber, expiresAt, notifyUser, returnUrl, isSandbox, sessionStudentId,accessToken, studentId, parentId, sectionId, classId, sessionId, schoolId  }) {
  try {
    const response = await createPaymentLinkApiService({ isSandbox, amount, currency, accountId, description, phone, email, referenceId: referenceNumber, expiresAt, notifyUser, returnUrl,accessToken });

    const data = response.payment_links;
    const params = {
      paymentLinkId: data.payment_link_id,
      paymentLinkExpiresAt: new Date(data.expires_at_formatted),
      amount: data.amount,
      amountPaid: data.amount_paid,
      currency: data.currency,
      status: data.status,
      paymentLinkReferenceId: data.reference_id,
      paymentLinkDescription: data.description,
      paymentLinkReturnUrl: data.return_url,
      paymentLinkEmail: data.email,
      paymentLinkPhone: data.phone,
      PaymentLinkUrl: data.url,
      section: sectionId,
      classId: classId,
      session: sessionId,
      school: schoolId,
      parent: parentId,
      sessionStudent: sessionStudentId,
      student: studentId
    }
    const paymentLink = await createPaymentTransactionService(params);
    return response;
  } catch (error) {
    throw error;
  }
}

function generateInvoiceNumber({ sessionStudentId }) {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `INV-${date}-${sessionStudentId.toString().slice(-6)}-${Math.floor(Math.random() * 900000) + 100000}`;
}

function generateReferenceNumber({ sessionStudentId }) {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `REF-${date}-${sessionStudentId.toString().slice(-6)}-${Math.floor(Math.random() * 900000) + 100000}`;
}