import { StatusCodes } from "http-status-codes";
import { error, success } from "../../utills/responseWrapper";
import { getPaymentTransactionService } from "../../services/paymentTransaction.service";

export async function schoolPaymentsController(req, res) {
  try {
    // returns data for school:
    // 1. collected fees
    // 2. pending payments
    // 3. overdue payments
    // 4. refunded amount
    const data = {
      collectedFee: 1000,
      pending: 1000,
      overdue:1000,
      refunded: 1000
    }
    return res.status(StatusCodes.OK).send(success(200, data));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }  
}


export async function monthlyPaymentsSummaryController(req, res) {
  try {
    // returns month wise collected fees
    
    return res.status(StatusCodes.OK).send(success(200, {}));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}


export async function paymentsByPaymentModesController(req, res) {
  try {
    // return total collected fee by payment modes
    // 1. UPI
    // 2. Net Banking
    // 3. Credit Card
    const data = {
      upi: 1000,
      netBanking: 1000,
      creditCard: 1000
    }
    return res.status(StatusCodes.OK).send(success(200, data));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function paymentTransactionsController(req, res) {
  try {
    // return payment-transactions for
    // section
    // class
    // school
    const data = await getPaymentTransactionService({});
    return res.status(StatusCodes.OK).send(success(200, data));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function sectionFeeSummaryController(req, res) {
  try {
      // return section fee summary
      // 1. Collected fee
      // 2. Expected fee
      // 3. Pending fee
      const data = {
        collectedFee: 1000,
        expectedFee: 1000,
        pendingFee: 1000
      }
    return res.status(StatusCodes.OK).send(success(200, data));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function sectionStudentsWithPaymentController(req, res) {
  try {
    // return list of students with payment status
    const data = [
      {
        studentId: "string",
        name: "string",
        paymentStatus: "paid/pending/overdue"
      }
    ]
    return res.status(StatusCodes.OK).send(success(200, data));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}