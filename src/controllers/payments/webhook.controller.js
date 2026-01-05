import { getPaymentTransactionService, updatePaymentTransactionService } from "../../services/paymentTransaction.service.js";

export async function paymentWebhookController(req, res) {
  try {
    const body = req.body;
    const { event_id, event_type, account_id,event_time, event_object } = body;
    const { payment_link_id, payments, status} = event_object['payment_links'];
    const { payment_id, amount, date, status: paymentStatus } = payments[0];

   const transactionStatus = paymentStatus === 'succeeded' ? 'paid' : 'failed';

   const updateData = {
    status: transactionStatus,
    zohoPaymentId: payment_id,
    paidAt: paymentStatus === 'succeeded' ? new Date(date * 1000) : null,
    webhookId: event_id,
    webhookType: event_type,
    webhookAccountId: account_id,
    webhookEventTime: new Date(event_time)
   };

   console.log({updateData});
   const paymentTransaction = await getPaymentTransactionService({ paymentLinkId: payment_link_id });
   if (!paymentTransaction) {
    console.log("Payment transaction not found for paymentLinkId:", payment_link_id);
    return res.status(404).json({ message: "Payment transaction not found"});
   }

   await updatePaymentTransactionService({ _id: paymentTransaction._id }, updateData);
   console.log("Payment transaction updated successfully for paymentLinkId:", payment_link_id);
   return res.status(200).json({ message: "Webhook received successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

export async function paymentWebhookV2Controller(req, res) {
  try {
    const body = req.body;
    const { event_id, event_type, account_id, event_time, event_object } = body;
    
    if (!event_object?.payment) {
      console.error("Invalid webhook format: missing event_object.payment");
      return res.status(400).json({ message: "Invalid webhook format" });
    }

    const payment = event_object.payment;
    const { payment_id, amount, date, payments_session_id, payment_link_id } = payment;

    const transactionStatus = event_type === 'payment.succeeded' ? 'paid' : 'failed';

    const updateData = {
      status: transactionStatus,
      zohoPaymentId: payment_id,
      paidAt: transactionStatus === 'paid' ? new Date(date * 1000) : null,
      webhookId: event_id,
      webhookType: event_type,
      webhookAccountId: account_id,
      webhookEventTime: new Date(event_time),
      amount: parseFloat(amount),
      currency: payment.currency,
      paymentMethod: payment.payment_method?.type,
    };

    // Add failure details if payment failed
    if (event_type === 'payment.failed') {
      updateData.failureCode = payment.failure_code;
      updateData.failureCategory = payment.failure_category;
      updateData.failureTip = payment.tip;
    }

    let paymentTransaction = await getPaymentTransactionService({ 
      paymentsSessionId: payments_session_id 
    });
    
    if (!paymentTransaction && payment_link_id) {
      paymentTransaction = await getPaymentTransactionService({ 
        paymentLinkId: payment_link_id 
      });
    }
    
    if (!paymentTransaction) {
      console.log("Payment transaction not found for paymentsSessionId:", payments_session_id, "or paymentLinkId:", payment_link_id);
      return res.status(404).json({ message: "Payment transaction not found" });
    }

    await updatePaymentTransactionService({ _id: paymentTransaction._id }, updateData);
    console.log("Payment transaction updated successfully");

    // ledger entry
    // recordPaymentReceived({ studentId, amount, gatewayRef, metadata});
    
    return res.status(200).json({ message: "Webhook received successfully" });
  } catch (error) {
    console.error("Webhook V2 error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
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