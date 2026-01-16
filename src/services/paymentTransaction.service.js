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

export async function getPaymentTransactionService(filter, projection={}) {
  try {
    const paymentSession = await paymentTransactionModel.findOne(filter).select(projection).lean();
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


export async function getPaymentTransactionPipelineService(pipeline){
  try {
    const paymentTransactions = await paymentTransactionModel.aggregate(pipeline).exec();
    return paymentTransactions;
  } catch (error) {
    throw error;    
  }
}


/**
 * 
 * @param { studentId, amount, gatewayRef: transactionId or related key, metadata} 
 * @returns 
 */
export async function recordPaymentReceived({ studentId, amount, gatewayRef, metadata }) {
  if (amount <= 0) throw new Error('Amount must be positive');
  // Idempotency: avoid duplicate PaymentReceived for same gateway ref and student
  const existing = await ledgerEventModel.findOne({
    eventType: 'PaymentReceived',
    studentId,
    externalRef: gatewayRef,
  });
  if (existing) return existing;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const [event] = await ledgerEventModel.create([
      {
        eventType: 'PaymentReceived',
        studentId,
        feeInstallmentId: null,
        amount,
        actorType: 'gateway',
        actorId: 'zoho_payment_gateway',
        externalRef: gatewayRef,
        reason: 'Payment received from payment gateway',
        metadata,
      },
    ],
      { session });


    // Payment allocation to installments is handled by FIFO logic and cron as per the spec.
    await session.commitTransaction();
    session.endSession();
    return event;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}