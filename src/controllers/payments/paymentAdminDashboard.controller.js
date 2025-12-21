import { StatusCodes } from "http-status-codes";
import { error, success } from "../../utills/responseWrapper";

export async function schoolPaymentsController(req, res) {
  try {
    // returns data for school:
    // 1. collected fees
    // 2. pending payments
    // 3. overdue payments
    // 4. refunded amount
    return res.status(StatusCodes.OK).send(success(200, {}));
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
    return res.status(StatusCodes.OK).send(success(200, {}));
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
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function sectionStudentsWithPaymentController(req, res) {
  try {
    // return list of students with payment status
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}