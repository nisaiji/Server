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
