import paymentTransactionModel from "../models/payments/paymentTransaction.model.js";
import ledgerEventModel from "../models/ledgerEvent.model.js";

export async function createPaymentTransactionService(data) {
  try {
    const payment = await paymentTransactionModel.create(data);
    return payment;
  } catch (error) {
    throw error;
  }
}

export async function getPaymentTransactionService(filter) {
  try {
    const paymentSession = await paymentTransactionModel.findOne(filter).lean();
    return paymentSession;
  } catch (error) {
    throw error;
  }
}

export async function getPaymentTransactionCountService(filter) {
  try {
    const count = await paymentTransactionModel.countDocuments(filter);
    return count;
  } catch (error) {
    throw error;
  }
}

export async function updatePaymentTransactionService(filter, update) {
  try {
    const paymentTransaction = await paymentTransactionModel.updateOne(filter, update);
    return paymentTransaction;
  } catch (error) {
    throw error;
  }
}