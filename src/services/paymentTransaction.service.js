import paymentTransactionModel from "../models/payments/paymentTransaction.model.js";

export async function createPaymentTransactionService(data) {
  try {
    const payment = await paymentTransactionModel.create(data);
    return payment;
  } catch (error) {
    throw error;
  }
}