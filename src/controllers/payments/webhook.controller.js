import { getPaymentTransactionService, updatePaymentTransactionService } from "../../services/paymentTransaction.service.js";
import { getRefundService, updateRefundService } from "../../services/refund.services.js";

export async function paymentWebhookController(req, res) {
  try {
    const body = req.body;
    const { event_id, event_type, account_id, event_time, event_object } = body;
    const { payment_link_id, payments, status } = event_object["payment_links"];
    const { payment_id, amount, date, status: paymentStatus } = payments[0];

    const transactionStatus = paymentStatus === "succeeded" ? "paid" : "failed";

    const updateData = {
      status: transactionStatus,
      zohoPaymentId: payment_id,
      paidAt: paymentStatus === "succeeded" ? new Date(date * 1000) : null,
      webhookId: event_id,
      webhookType: event_type,
      webhookAccountId: account_id,
      webhookEventTime: new Date(event_time),
    };

    console.log({ updateData });
    const paymentTransaction = await getPaymentTransactionService({
      paymentLinkId: payment_link_id,
    });
    if (!paymentTransaction) {
      console.log(
        "Payment transaction not found for paymentLinkId:",
        payment_link_id
      );
      return res.status(404).json({ message: "Payment transaction not found" });
    }

    await updatePaymentTransactionService(
      { _id: paymentTransaction._id },
      updateData
    );
    console.log(
      "Payment transaction updated successfully for paymentLinkId:",
      payment_link_id
    );
    return res.status(200).json({ message: "Webhook received successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
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
    const { payment_id, amount, date, payments_session_id, payment_link_id } =
      payment;

    const transactionStatus =
      event_type === "payment.succeeded" ? "paid" : "failed";

    const updateData = {
      status: transactionStatus,
      zohoPaymentId: payment_id,
      paidAt: transactionStatus === "paid" ? new Date(date * 1000) : null,
      webhookId: event_id,
      webhookType: event_type,
      webhookAccountId: account_id,
      webhookEventTime: new Date(event_time),
      amount: parseFloat(amount),
      currency: payment.currency,
      paymentMethod: payment.payment_method?.type,
    };

    // Add failure details if payment failed
    if (event_type === "payment.failed") {
      updateData.failureCode = payment.failure_code;
      updateData.failureCategory = payment.failure_category;
      updateData.failureTip = payment.tip;
    }

    let paymentTransaction = await getPaymentTransactionService({
      paymentsSessionId: payments_session_id,
    });

    if (!paymentTransaction && payment_link_id) {
      paymentTransaction = await getPaymentTransactionService({
        paymentLinkId: payment_link_id,
      });
    }

    if (!paymentTransaction) {
      console.log(
        "Payment transaction not found for paymentsSessionId:",
        payments_session_id,
        "or paymentLinkId:",
        payment_link_id
      );
      return res.status(404).json({ message: "Payment transaction not found" });
    }

    await updatePaymentTransactionService(
      { _id: paymentTransaction._id },
      updateData
    );
    console.log("Payment transaction updated successfully");

    return res.status(200).json({ message: "Webhook received successfully" });
  } catch (error) {
    console.error("Webhook V2 error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

// 11-01-2026
export async function paymentWebhookV3Controller(req, res) {
  let retryCount = 0;
  const body = req.body;
  const { event_id, event_type, account_id, event_time, event_object } = body;
  try {
    if (!event_object?.payment) {
      console.error("Invalid webhook format: missing event_object.payment");
      return res.status(400).json({ message: "Invalid webhook format" });
    }

    const payment = event_object.payment;
    const { payment_id, amount, date, payments_session_id, payment_link_id } =
      payment;

    //Using single query rather than two, and moved up, before calculation
    let paymentTransaction = await getPaymentTransactionService({
      $or: [
        { paymentsSessionId: payments_session_id },
        { paymentLinkId: payment_link_id },
      ],
    });

    if (!paymentTransaction) {
      console.log(
        "Payment transaction not found for paymentsSessionId:",
        payments_session_id,
        "or paymentLinkId:",
        payment_link_id
      );
      return res.status(404).json({ message: "Payment transaction not found" });
    }

    //check if webhookId is processed or not
    if (paymentTransaction.processed) {
      return res.status(200).json({ message: "Webhook already processed" });
    }

    const transactionStatus =
      event_type === "payment.succeeded" ? "paid" : "failed";

    const updateData = {
      status: transactionStatus,
      zohoPaymentId: payment_id,
      paidAt: transactionStatus === "paid" ? new Date(date * 1000) : null,
      webhookId: event_id,
      webhookType: event_type,
      webhookAccountId: account_id,
      webhookEventTime: new Date(event_time),
      amount: parseFloat(amount),
      currency: payment.currency,
      paymentMethod: payment.payment_method?.type,
      // Processed confirmation
      processed: true,
    };

    // Add failure details if payment failed
    if (event_type === "payment.failed") {
      updateData.failureCode = payment.failure_code;
      updateData.failureCategory = payment.failure_category;
      updateData.failureTip = payment.tip;
      // Allowing to retry on failed
      updateData.processed = false;
      updateData.retryCount = retryCount++;

      //11-01-2026
      // TODO kuldeep validate keys
      await registerLedgerEventService({
        eventType: "PaymentFailed",
        amount: parseFloat(amount),
        studentId: payment.student,
        actorType: "gateway",
        actorId: payment.parent,
        externalRef: payment.paymentReferenceId,
        metaData: {
          school: convertToMongoId(payment.school),
          session: convertToMongoId(payment.session),
        },
      });
      await recalcDashboard(school, session);
    }

    await updatePaymentTransactionService(
      { _id: paymentTransaction._id },
      updateData
    );
    console.log("Payment transaction updated successfully");

    if (event_type !== "payment.failed") {
      //Processing background ledger update
      await processPayment(updateData);
    }

    return res.status(200).json({ message: "Webhook received successfully" });
  } catch (error) {
    //updatig payment retry count, only if payment data exists
    if (
      event_object?.payment?.payments_session_id ||
      event_object?.payment?.payment_link_id
    ) {
      console.log("Webhook V2 Error: Updating retry count on any failure");
      await updatePaymentTransactionService(
        {
          $or: [
            { paymentsSessionId: event_object?.payment?.payments_session_id },
            { paymentLinkId: event_object?.payment?.payment_link_id },
          ],
        },
        { webhookId: event_id, retryCount: retryCount++ }
      );
    }

    console.error("Webhook V2 error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

export async function refundWebhookController(req, res) {
  try {
    const body = req.body;
    console.log({body: JSON.stringify(body)});
    const { event_id, event_type, account_id, event_time, event_object } = body;
    
    if (!event_object?.refund) {
      console.error("Invalid refund webhook format: missing event_object.refund");
      return res.status(400).json({ message: "Invalid webhook format" });
    }

    const refund = event_object.refund;
    const { refund_id, payment_id, status, date, failure_reason } = refund;

    const updateData = {
      status,
      refundDate: new Date(date * 1000),
      webhookId: event_id,
      webhookType: event_type,
      webhookAccountId: account_id,
      webhookEventTime: new Date(event_time),
      webhookProcessed: true
    };

    if (event_type === 'refund.failed') {
      updateData.failureReason = failure_reason;
    }

    const existingRefund = await getRefundService({ refundId: refund_id });
    if (!existingRefund) {
      console.log("Refund not found for refundId:", refund_id);
      return res.status(404).json({ message: "Refund not found" });
    }

    await updateRefundService({ refundId: refund_id }, updateData);
    console.log("Refund updated successfully for refundId:", refund_id);
    
    return res.status(200).json({ message: "Refund webhook received successfully" });
  } catch (error) {
    console.error("Refund webhook error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}