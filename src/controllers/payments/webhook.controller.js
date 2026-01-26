import { processRefund } from "../../services/balance.service.js";
import { calculateDaysBetweenDates } from "../../services/celender.service.js";
import { getFeeInstallmentService, getFeeInstallmentsPipelineService, getFeeInstallmentsService } from "../../services/feeStructure/feeInstallment.service.js";
import { getSchoolFeeStructureService } from "../../services/feeStructure/schoolFeeStructure.services.js";
import { registerLedgerEventService } from "../../services/ledgerEvent.service.js";
import { convertToMongoId } from "../../services/mongoose.services.js";
import { getPaymentTransactionService, updatePaymentTransactionService } from "../../services/paymentTransaction.service.js";
import { getRefundService, updateRefundService } from "../../services/refund.services.js";
import { getSessionStudentWalletService, registerSessionStudentWalletService, updateSessionStudentWalletService } from "../../services/sessionStudentWallet.services.js";
import { getStudentFeeInstallmentService, getStudentFeeInstallmentsPipelineService, registerStudentFeeInstallmentService, updateStudentFeeInstallmentService } from "../../services/studentFeeInstallment.service.js";

export async function paymentWebhookController(req, res) {
  try {
    const body = req.body;
    const { event_id, event_type, account_id, event_time, event_object } = body;
    const { payment_link_id, payments, status } = event_object['payment_links'];
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

    console.log({ updateData });
    const paymentTransaction = await getPaymentTransactionService({ paymentLinkId: payment_link_id });
    if (!paymentTransaction) {
      console.log("Payment transaction not found for paymentLinkId:", payment_link_id);
      return res.status(404).json({ message: "Payment transaction not found" });
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

    return res.status(200).json({ message: "Webhook received successfully" });
  } catch (error) {
    console.error("Webhook V2 error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

// 11-01-2026
export async function paymentWebhookV3Controller(req, res) {
  let retryCount = 0;
  const body = req.body;
  const { event_id, event_type, account_id, event_time, event_object } = body;
  console.log("Received webhook event: event_type: ", event_type, " for account: ", account_id);
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

    // check if webhookId is processed or not
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
      currency: paymentTransaction.currency,
      paymentMethod: paymentTransaction.payment_method?.type,
      // Processed confirmation
      processed: true,
    };

    // Add failure details if payment failed
    if (event_type === "payment.failed") {
      updateData.failureCode = paymentTransaction.failure_code;
      updateData.failureCategory = paymentTransaction.failure_category;
      updateData.failureTip = paymentTransaction.tip;
      // Allowing to retry on failed
      updateData.processed = false;
      updateData.retryCount = retryCount++;

      //11-01-2026
      // TODO kuldeep validate keys
      await registerLedgerEventService({
        eventType: "PaymentFailed",
        amount: parseFloat(amount),
        sessionStudentId: paymentTransaction.sessionStudentId,
        actorType: "gateway",
        actorId: paymentTransaction.parent,
        externalRef: paymentTransaction.paymentReferenceId,
        metaData: {
          school: convertToMongoId(paymentTransaction.school),
          session: convertToMongoId(paymentTransaction.session),
        },
      });
    }

    await updatePaymentTransactionService(
      { _id: paymentTransaction._id },
      updateData
    );
    const updatedPaymentTransaction = await getPaymentTransactionService({ _id: paymentTransaction._id });
    console.log("Payment transaction updated successfully");

    if (event_type !== "payment.failed") {
      //Processing background ledger update
      await processPayment(updatedPaymentTransaction);
    }

    return res.status(200).json({ message: "Webhook received successfully" });
  } catch (error) {
    //updatig payment retry count, only if payment data exists
    if (
      event_object?.paymentTransaction?.payments_session_id ||
      event_object?.paymentTransaction?.payment_link_id
    ) {
      console.log("Webhook V2 Error: Updating retry count on any failure");
      await updatePaymentTransactionService(
        {
          $or: [
            { paymentsSessionId: event_object?.paymentTransaction?.payments_session_id },
            { paymentLinkId: event_object?.paymentTransaction?.payment_link_id },
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
    console.log({ body: JSON.stringify(body) });
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

    const [existingRefund, paymentTransaction] = await Promise.all([
      getRefundService({ refundId: refund_id }),
      getPaymentTransactionService({ zohoPaymentId: payment_id })
    ]);
    if (!existingRefund) {
      console.log("Refund not found for refundId:", refund_id);
      return res.status(404).json({ message: "Refund not found" });
    }

    if (!paymentTransaction) {
      console.log("paymentTransaction not found for zohoPaymentId:", payment_id);
      return res.status(404).json({ message: "paymentTransaction not found" });
    }

    await updateRefundService({ refundId: refund_id }, updateData);
    await updatePaymentTransactionService({ _id: paymentTransaction._id }, { status: "refunded", refundedAt: new Date(date * 1000) });
    console.log("Refund updated successfully for refundId:", refund_id);

    const refundedPaymentTransaction = await getPaymentTransactionService({ _id: paymentTransaction._id });

    //Processing background ledger update for refund
    await processRefund(refundedPaymentTransaction);

    return res.status(200).json({ message: "Refund webhook received successfully" });
  } catch (error) {
    console.error("Refund webhook error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

async function processPayment(paymentTransaction) {
  try {
    const existingWallet = await getSessionStudentWalletService({
      sessionStudent: paymentTransaction.sessionStudent
    });

    if (existingWallet) {
      await updateSessionStudentWalletService(
        { sessionStudent: paymentTransaction.sessionStudent },
        { 
          balance: existingWallet.balance + parseFloat(paymentTransaction.amount),
          totalCredits: existingWallet.totalCredits + parseFloat(paymentTransaction.amount)
        }
      );
    } else {
      await registerSessionStudentWalletService({
        sessionStudent: paymentTransaction.sessionStudent,
        student: paymentTransaction.student,
        school: paymentTransaction.school,
        session: paymentTransaction.session,
        balance: parseFloat(paymentTransaction.amount),
        totalCredits: parseFloat(paymentTransaction.amount)
      });
    }
  } catch (error) {
    console.error('Error processing payment for wallet:', error);
  }
}

// async function processPayment(paymentTransaction) {
//   try {
//     // 1. Create ledger event for payment transaction
//     await registerLedgerEventService({
//       eventType: "PaymentReceived",
//       amount: parseFloat(paymentTransaction.amount),
//       sessionStudentId: paymentTransaction.sessionStudent,
//       actorType: "gateway",
//       actorId: paymentTransaction.parent,
//       externalRef: paymentTransaction.paymentReferenceId,
//       metaData: {
//         school: convertToMongoId(paymentTransaction.school),
//         session: convertToMongoId(paymentTransaction.session),
//         transactionId: paymentTransaction._id
//       },
//     });

//     const studentFeeInstallments = await getStudentFeeInstallmentsPipelineService([
//       {
//         $match: {
//           sessionStudent: paymentTransaction.sessionStudent,
//           status: {
//             $in: ["partial"]
//           }
//         }
//       },
//       {
//         $sort: {
//           dueDate: 1
//         }
//       }
//     ])

//     console.log(`studentFeeInstallments`, studentFeeInstallments);

//     const feeInstallments = await getFeeInstallmentsPipelineService([
//       {
//         $match: {
//           section: paymentTransaction.section,
//           isActive: true,
//           dueDate: { $lte: new Date() },
//           ...(studentFeeInstallments.length > 0 && { dueDate: { $gt: studentFeeInstallments[0].dueDate } })
//         }
//       },
//       {
//         $sort: {
//           dueDate: 1
//         }
//       }
//     ])

//     console.log(`feeInstallments : `, feeInstallments);

//     const schoolFeeStructure = await getSchoolFeeStructureService({ school: paymentTransaction.school });

//     let paidAmount = parseFloat(paymentTransaction.amount);
//     const studentFeeInstallment = studentFeeInstallments[0];
//     if (studentFeeInstallment) {
//       const currentDate = new Date();
//       const dueDate = new Date(studentFeeInstallment.dueDate);
//       const isOverdue = currentDate > dueDate;

//       let lateFee = 0;
//       if (isOverdue) {
//         const days = calculateDaysBetweenDates(dueDate, currentDate);
//         const lateFeePercentPerDay = schoolFeeStructure.lateFeePercent / 365; // Assuming lateFeePercent is annual
//         lateFee = Math.round((studentFeeInstallment.baseAmount - studentFeeInstallment.amountPaid) * lateFeePercentPerDay * days);
//         console.log(`No of days for late fee: `, days);
//         console.log(`Late fee percentage per day: `, lateFeePercentPerDay);
//         console.log(`Late fee calculated: `, lateFee);
//       }

//       const totalPayable = studentFeeInstallment.baseAmount + lateFee;
//       const newAmountPaid = studentFeeInstallment.amountPaid + paidAmount;
//       console.log(`LateFee: `, lateFee);
//       console.log(`total payable: `, totalPayable);
//       console.log(`new amount paid: `, newAmountPaid);
//       let newStatus;
//       if (newAmountPaid >= totalPayable) {
//         newStatus = "paid";
//         paidAmount = newAmountPaid - totalPayable;
//       } else {
//         newStatus = "partial";
//         paidAmount = 0;
//       }

//       await updateStudentFeeInstallmentService(
//         { _id: studentFeeInstallment._id },
//         {
//           amountPaid: Math.min(newAmountPaid, totalPayable),
//           lateFeeApplied: lateFee,
//           totalPayable: totalPayable,
//           status: newStatus
//         }
//       );
//     }

//     console.log(`Remaining paidAmount after existing installment: `, paidAmount);
//     while (paidAmount > 0 && feeInstallments.length > 0) {
//       let feeInstallment = feeInstallments[0];
//       const currentDate = new Date();
//       const dueDate = new Date(feeInstallment.dueDate);
//       const isOverdue = currentDate > dueDate;

//       console.log(`Processing fee installment: `, feeInstallment);
//       let lateFee = 0;
//       if (isOverdue) {
//         const days = calculateDaysBetweenDates(dueDate, currentDate);
//         const lateFeePercentPerDay = schoolFeeStructure.lateFeePercent / 365; // Assuming lateFeePercent is annual
//         lateFee = Math.round(feeInstallment.amount * lateFeePercentPerDay * days);
//         console.log(`No of days for late fee: `, days);
//         console.log(`Late fee percentage per day: `, lateFeePercentPerDay);
//         console.log(`Late fee calculated: `, lateFee);
//       }

//       const totalPayable = feeInstallment.amount + lateFee;

//       console.log(`Total Payable amount: `, totalPayable);

//       let status;
//       let amountPaid;
//       if (paidAmount >= totalPayable) {
//         status = "paid";
//         amountPaid = totalPayable;
//         paidAmount = paidAmount - totalPayable;
//       } else {
//         status = "partial";
//         amountPaid = paidAmount;
//         paidAmount = 0;
//       }
//       await registerStudentFeeInstallmentService({
//         feeInstallment: feeInstallment._id,
//         sessionStudent: paymentTransaction.sessionStudent,
//         student: paymentTransaction.student,
//         school: paymentTransaction.school,
//         session: paymentTransaction.session,
//         classId: paymentTransaction.classId,
//         section: paymentTransaction.section,
//         month: feeInstallment.installmentNumber,
//         baseAmount: feeInstallment.amount,
//         lateFeeApplied: lateFee,
//         totalPayable: totalPayable,
//         amountPaid,
//         status,
//         dueDate: feeInstallment.dueDate
//       });
//     }

//     if (paidAmount > 0) {
//       // advance payment handling
//     }

//     // 2. Get student's oldest unpaid fee installment
//     // let studentInstallment = await getStudentFeeInstallmentService(
//     //   {
//     //     sessionStudent: paymentTransaction.sessionStudent,
//     //     status: { $in: ["pending", "partial", "overdue"] }
//     //   },
//     //   {},
//     //   { dueDate: 1 } // Sort by oldest due date first
//     // );

//     // // 3. If no pending/partial installment found, get next unpaid installment
//     // if (!studentInstallment) {
//     //   const nextFeeInstallments = await getFeeInstallmentsService({
//     //     section: paymentTransaction.section,
//     //     isActive: true
//     //   }, {}, { dueDate: 1 });

//     //   const nextFeeInstallment = nextFeeInstallments[0];

//     //   if (nextFeeInstallment) {
//     //     // Create new student fee installment record
//     //     const currentDate = new Date();
//     //     const dueDate = new Date(nextFeeInstallment.dueDate);
//     //     const isOverdue = currentDate > dueDate;

//     //     let lateFee = 0;
//     //     if (isOverdue) {
//     //       lateFee = Math.round(nextFeeInstallment.amount * 0.12); // Todo: use percent from sectionFeeStructure
//     //     }

//     //     const totalPayable = nextFeeInstallment.amount + lateFee;

//     // studentInstallment = await registerStudentFeeInstallmentService({
//     //   feeInstallment: nextFeeInstallment._id,
//     //   sessionStudent: paymentTransaction.sessionStudent,
//     //   student: paymentTransaction.student,
//     //   school: paymentTransaction.school,
//     //   session: paymentTransaction.session,
//     //   classId: paymentTransaction.classId,
//     //   section: paymentTransaction.section,
//     //   month: nextFeeInstallment.installmentNumber,
//     //   baseAmount: nextFeeInstallment.amount,
//     //   lateFeeApplied: lateFee,
//     //   totalPayable: totalPayable,
//     //   amountPaid: 0,
//     //   status: isOverdue ? "overdue" : "pending",
//     //   dueDate: dueDate
//     // });
//     //   }
//     // }

//     // // 4. Process payment against installment
//     // if (studentInstallment) {
//     // const currentDate = new Date();
//     // const dueDate = new Date(studentInstallment.dueDate);
//     // const isOverdue = currentDate > dueDate;

//     // // Calculate late fee if payment is after due date and not already applied
//     // let additionalLateFee = 0;
//     // if (isOverdue && studentInstallment.lateFeeApplied === 0) {
//     //   additionalLateFee = Math.round(studentInstallment.baseAmount * 0.12);
//     // }

//     // const totalPayable = studentInstallment.baseAmount + studentInstallment.lateFeeApplied + additionalLateFee;
//     // const newAmountPaid = studentInstallment.amountPaid + remainingAmount;

//     // let newStatus;
//     // if (newAmountPaid >= totalPayable) {
//     //   newStatus = "paid";
//     //   remainingAmount = newAmountPaid - totalPayable;
//     // } else {
//     //   newStatus = "partial";
//     //   remainingAmount = 0;
//     // }

//     // // Update student fee installment
//     // await updateStudentFeeInstallmentService(
//     //   { _id: studentInstallment._id },
//     //   {
//     //     amountPaid: Math.min(newAmountPaid, totalPayable),
//     //     lateFeeApplied: studentInstallment.lateFeeApplied + additionalLateFee,
//     //     totalPayable: totalPayable,
//     //     status: newStatus
//     //   }
//     // );

//     //   // 5. Handle excess payment for next installment
//     //   console.log({ remainingAmount });
//     //   if (remainingAmount > 0) {
//     //     // Get next unpaid installment
//     //     const nextInstallments = await getFeeInstallmentsService({
//     //       section: convertToMongoId(paymentTransaction.section),
//     //       isActive: true,
//     //       dueDate: { $gt: new Date(studentInstallment.dueDate) }
//     //     }, {}, { dueDate: 1 });

//     //     console.log({ nextInstallments, date: new Date(studentInstallment.dueDate), section: paymentTransaction.section });
//     //     if (nextInstallments.length > 0) {
//     //       const nextFeeInstallment = nextInstallments[0];
//     //       console.log({ nextFeeInstallment });

//     //       // Check if student installment already exists for next fee installment
//     //       let nextStudentInstallment = await getStudentFeeInstallmentService({
//     //         sessionStudent: paymentTransaction.sessionStudent,
//     //         feeInstallment: nextFeeInstallment._id
//     //       });

//     //       // Create next student installment if doesn't exist
//     //       if (!nextStudentInstallment) {
//     //         const currentDate = new Date();
//     //         const nextDueDate = new Date(nextFeeInstallment.dueDate);
//     //         const isNextOverdue = currentDate > nextDueDate;

//     //         let nextLateFee = 0;
//     //         if (isNextOverdue) {
//     //           nextLateFee = Math.round(nextFeeInstallment.amount * 0.12);
//     //         }

//     //         nextStudentInstallment = await registerStudentFeeInstallmentService({
//     //           feeInstallment: nextFeeInstallment._id,
//     //           sessionStudent: paymentTransaction.sessionStudent,
//     //           student: paymentTransaction.student,
//     //           school: paymentTransaction.school,
//     //           session: paymentTransaction.session,
//     //           classId: paymentTransaction.classId,
//     //           section: paymentTransaction.section,
//     //           month: nextFeeInstallment.installmentNumber,
//     //           baseAmount: nextFeeInstallment.amount,
//     //           lateFeeApplied: nextLateFee,
//     //           totalPayable: nextFeeInstallment.amount + nextLateFee,
//     //           amountPaid: 0,
//     //           status: isNextOverdue ? "overdue" : "pending",
//     //           dueDate: nextDueDate
//     //         });
//     //       }

//     //       // Apply remaining amount to next installment
//     //       const nextTotalPayable = nextStudentInstallment.totalPayable;
//     //       const nextNewAmountPaid = nextStudentInstallment.amountPaid + remainingAmount;

//     //       let nextNewStatus;
//     //       if (nextNewAmountPaid >= nextTotalPayable) {
//     //         nextNewStatus = "paid";
//     //       } else {
//     //         nextNewStatus = "partial";
//     //       }

//     //       await updateStudentFeeInstallmentService(
//     //         { _id: nextStudentInstallment._id },
//     //         {
//     //           amountPaid: Math.min(nextNewAmountPaid, nextTotalPayable),
//     //           status: nextNewStatus
//     //         }
//     //       );
//     //     }
//     //   }

//     // }
//     console.log("Payment processed successfully for sessionStudentId:", paymentTransaction.sessionStudentId);
//   } catch (error) {
//     console.error("Error processing payment:", error);
//     throw error;
//   }
// }