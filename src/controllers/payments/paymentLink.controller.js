import { StatusCodes } from "http-status-codes";
import { error, success } from "../../utills/responseWrapper.js";
import { createPaymentLinkApiService, createPaymentSessionApiService, refreshTokenService } from "../../services/zohoPayment.service.js";
import { createPaymentSessionService } from "../../services/paymentSession.service.js";
import { getSessionStudentService } from "../../services/v2/sessionStudent.service.js";
import { config } from "../../config/config.js";
import { getMarchantPaymentConfigService, updateMarchantPaymentConfigService } from "../../services/marchantPaymentConfig.service.js";
import { getStudentService } from "../../services/student.service.js";
import { getAdminService } from "../../services/admin.services.js";
import { createPaymentTransactionService, getPaymentTransactionService, getPaymentTransactionsService } from "../../services/paymentTransaction.service.js";
import { getParentService } from "../../services/v2/parent.services.js";
import logger from "../../logger/index.js";
import { getFormattedNewDateService } from "../../services/celender.service.js";
import { getStudentFeeInstallmentsService } from "../../services/studentFeeInstallment.service.js";
import { getFeeInstallmentsService } from "../../services/feeStructure/feeInstallment.service.js";
import { convertToMongoId } from "../../services/mongoose.services.js";
import { getSectionFeeStructureService } from "../../services/feeStructure/sectionFeeStructure.services.js";

export async function createPaymentLinkController(req, res) {
  try {
    const { amount, sessionStudentId } = req.body;
    logger.info("Creating payment link", { requestBody: req.body });
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

   const totalPayable = await getTotalPayableAmount(sessionStudentId);
   const totalPaid = await getTotalPaidAmount(sessionStudentId);
   console.log({ totalPayable, totalPaid });

   if(totalPaid >= totalPayable) {
    return res.status(StatusCodes.BAD_REQUEST).send(error(400, "No dues pending for this student"));
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
      logger.info("Zoho access token refreshed", { marchantId: marchant._id, expiresAt });
      marchant = await getMarchantPaymentConfigService({ _id: marchant._id });
    }

    const linkExpiryDate = new Date();
    linkExpiryDate.setDate(linkExpiryDate.getDate() + 5);
    const formattedExpiryDate = getFormattedNewDateService(linkExpiryDate);
    console.log({linkExpiryDate: formattedExpiryDate})

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
      invoiceNumber: generateInvoiceNumber({sessionStudentId: sessionStudent['_id']}),
      expiresAt: formattedExpiryDate,
      notifyUser: true,
      returnUrl: config.zohoRedirectUrl
    })
    return res.status(StatusCodes.OK).send(success(200, paymentLinkResponse));
  } catch (err) {
    logger.error("Error creating payment link", {}, err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}


export async function verifyPaymentController(req, res) {
  try {
    const { signature, paymentLinkId, paymentLinkReference, amount, status, paymentId } = req.body;
    const payment = await getPaymentTransactionService({
      paymentReferenceId: paymentLinkReference, 
      paymentLinkId: paymentLinkId, 
      amount: amount, 
      zohoPaymentId: paymentId, 
      status: "paid"
    });
    
    if(!payment){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Invalid Request"));
    }

    return res.status(StatusCodes.OK).send(success(200, {paymentCycle: "monthly", paymentMethod: "UPI", paymentDate: new Date(), amountPaid: amount, paymentId, paymentLinkId}));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

// ------------------------HELPER FUNCTIONS------------------------
async function createPaymentLink({amount, currency, accountId, description, phone, email, referenceNumber, invoiceNumber, expiresAt, notifyUser, returnUrl, isSandbox, sessionStudentId,accessToken, studentId, parentId, sectionId, classId, sessionId, schoolId  }) {
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
      paymentReferenceId: data.reference_id,
      paymentInvoiceId: invoiceNumber,
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
  return `INV-${d.getTime()}-${sessionStudentId}-${Math.floor(Math.random() * 90000000) + 10000000}`;
}

function generateReferenceNumber({ sessionStudentId }) {
  const d = new Date();
  return `REF-${d.getTime()}-${sessionStudentId}-${Math.floor(Math.random() * 90000000) + 10000000}`;
}

async function getTotalPayableAmount(sessionStudentId) {
  try {
    const sessionStudent = await getSessionStudentService({_id: sessionStudentId});
    if (!sessionStudent) {
      throw new Error('Session student not found');
    }

    const studentFeeInstallments = await getStudentFeeInstallmentsService({
      sessionStudent: sessionStudentId
    });

    const feeInstallmentIds = studentFeeInstallments.map(sfi => convertToMongoId(sfi.feeInstallment));

    const studentFeeInstallmentsTotal = studentFeeInstallments.reduce((sum, installment) => {
      return sum + (installment.totalPayable || 0);
    }, 0);

    const sectionFeeStructure = await getSectionFeeStructureService({
      section: sessionStudent.section
    });

    if(!sectionFeeStructure) {
      throw new Error('Section fee structure not found');
    }

    const feeInstallments = await getFeeInstallmentsService({
      sectionFeeStructure: sectionFeeStructure._id,
      _id: { $nin: feeInstallmentIds }
    });

    const feeInstallmentsTotal = feeInstallments.reduce((sum, installment) => {
      return sum + (installment.amount || 0);
    }, 0);

    return studentFeeInstallmentsTotal + feeInstallmentsTotal;
  } catch (error) {
    throw error;
  }
}

async function getTotalPaidAmount(sessionStudentId) {
  try {
    const payments = await getPaymentTransactionsService({ sessionStudent: sessionStudentId, status: "paid" });
    console.log({payments});
    const totalPaid = payments.reduce((sum, payment) => {
      return sum + (payment.amount || 0);
    }, 0);
    return totalPaid;
  } catch (error) {
    throw error;
  }
}