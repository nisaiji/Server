import { StatusCodes } from "http-status-codes";
import { getAdminService } from "../../services/admin.services.js";
import { getMarchantPaymentConfigService, updateMarchantPaymentConfigService } from "../../services/marchantPaymentConfig.service.js";
import { getParentService } from "../../services/parent.services.js";
import { getStudentService } from "../../services/student.service.js";
import { getSessionStudentService } from "../../services/v2/sessionStudent.service.js";
import { createPaymentSessionApiService, refreshTokenService } from "../../services/zohoPayment.service.js";
import { error, success } from "../../utills/responseWrapper.js";
import {config} from "../../config/config.js";
import { createPaymentTransactionService } from "../../services/paymentTransaction.service.js";

export async function createPaymentSessionController(req, res) {
  try {
    const { amount, sessionStudentId } = req.body;
    const parentId = req.parentId;
    const sessionStudent = await getSessionStudentService({_id: sessionStudentId});
    if(!sessionStudent) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Student not found"));
    }

    let [school, marchant, student, parent] = await Promise.all([
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

      marchant = await getMarchantPaymentConfigService({ _id: marchant._id });
    }
    const paymentLinkResponse = await createPaymentSession({
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
      phone: parent?.phone,
      email: parent?.email,
      expiresAt: "2025-12-30",
      notifyUser: true,
      returnUrl: config.zohoRedirectUrl
    });

    return res.status(StatusCodes.OK).send(success(200, paymentLinkResponse));
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
    if(response.message !== "success") {
      throw new Error("Failed to create payment session");
    }

    const data = response.payments_session;
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 15);

    const params = {
      paymentSessionId: data.payments_session_id,
      paymentSessionExpiresAt: expiryDate,
      amount: data.amount,
      currency: data.currency,
      paymentReferenceId: data.reference_number,
      paymentInvoiceceId: data.invoice_number,
      paymentLinkDescription: data.description,
      section: sectionId,
      classId: classId,
      session: sessionId,
      school: schoolId,
      parent: parentId,
      status: 'sessionInitiated',
      sessionStudent: sessionStudentId,
      student: studentId
    }
    const paymentSession = await createPaymentTransactionService(params);
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
