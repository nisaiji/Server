"use strict";

import ledgerEventModel from "../models/ledgerEvent.model.js";
import StudentFeeInstallmentModel from "../models/feeStructure/studentFeeInstallment.model.js";
import FeeDashboardSnapshotModel from "../models/feeStructure/feeDashboardSnapshot.model.js";
import {
  getLedgerEventsCountService,
  registerLedgerEventService,
  getLedgerEventsPipelineService,
} from "./ledgerEvent.service.js";
import {
  getStudentFeeInstallmentsService,
  updateStudentFeeInstallmentService,
  getStudentFeeInstallmentsPipelineService,
} from "./studentFeeInstallment.service.js";
import { updateFeeDashboardSnapshotService } from "./feeDashboardSnapshot.service.js";
import { convertToMongoId } from "../services/mongoose.services.js";
import studentFeeInstallmentModel from "../models/feeStructure/studentFeeInstallment.model.js";

// // Advance = sum(PaymentReceived) - sum(AdvanceAppliedToInstallment) - sum(RefundIssued);
// export async function getStudentAdvanceBalance(studentId) {
//   try {
//     const result = await ledgerEvent.aggregate([
//       {
//         $match: {
//           studentId,
//           eventType: {
//             $in: [
//               "PaymentReceived",
//               "AdvanceAppliedToInstallment",
//               "RefundIssued",
//             ],
//           },
//         },
//       },
//       {
//         $group: {
//           _id: "$eventType",
//           total: { $sum: "$amount" },
//         },
//       },
//     ]);

//     const paymentReceived = 0,
//       advanceApplied = 0,
//       refundIssued = 0;
//     for (const record of result) {
//       if (record._id === "PaymentReceived") paymentReceived = record.total;
//       if (record._id === "AdvanceAppliedToInstallment")
//         advanceApplied = record.total;
//       if (record._id === "RefundIssued") refundIssued = record.total;
//     }

//     return paymentReceived - advanceApplied - refundIssued;
//   } catch (error) {
//     throw new Error("Error calculating advance balance: " + error.message);
//   }
// }

// // outstanding principle per installment = principalAmount - AdvanceAppliedToInstallment - concessionsGranted
// export async function getInstallmentPrincipleOutstanding(feeInstallmentId) {
//   try {
//     const installment = await feeInstallments.findById(feeInstallmentId);
//     if (!installment) {
//       throw new Error("Installment not found");
//     }

//     const result = await ledgerEvent.aggregate([
//       {
//         $match: {
//           feeInstallmentId,
//           eventType: {
//             $in: ["AdvanceAppliedToInstallment", "ConcessionGranted"],
//           },
//         },
//       },
//       {
//         $group: {
//           _id: "$eventType",
//           total: { $sum: "$amount" },
//         },
//       },
//     ]);

//     let advanceApplied = 0,
//       concessionsGranted = 0;
//     for (const record of result) {
//       if (record._id === "AdvanceAppliedToInstallment")
//         advanceApplied = record.total;
//       if (record._id === "ConcessionGranted")
//         concessionsGranted = record.total;
//     }

//     return Math.max(
//       installment.principalAmount - advanceApplied - concessionsGranted,
//       0
//     );
//   } catch (error) {
//     throw new Error(
//       "Error calculating outstanding principle: " + error.message
//     );
//   }
// }

// //Late fee outstanding per installment = lateFeeAccured - LateFeeWaived
// export async function getInstallmentLateFeeOutstanding(feeInstallmentId) {
//   try {
//     const result = await ledgerEvent.aggregate([
//       {
//         $match: {
//           feeInstallmentId,
//           eventType: { $in: ["LateFeeAccrued", "LateFeeWaived"] },
//         },
//       },
//       {
//         $group: {
//           _id: "$eventType",
//           total: { $sum: "$amount" },
//         },
//       },
//     ]);

//     let accured = 0,
//       waived = 0;
//     for (const record of result) {
//       if (record._id === "LateFeeAccrued") accured = record.total;
//       if (record._id === "LateFeeWaived") waived = record.total;
//     }
//     return Math.max(accured - waived, 0);
//   } catch (error) {
//     throw new Error(
//       "Error calculating total outstanding principle: " + error.message
//     );
//   }
// }

//afer zoho webhook call, creates ledger, manages installment
export async function processPayment(txn) {
  const testTxn = {
    _id: "695eadb092551c232e77e65e",
    paymentLinkId: "100000000091052",
    paymentLinkExpiresAt: new Date("2026-01-11T23:59:00.000+05:30"),
    paymentReferenceId: "REF-1767722056756-695e77da1f25102b2ad2d6bf-18354492",
    paymentInvoiceId: "INV-1767722056757-695e77da1f25102b2ad2d6bf-53763363",
    paymentLinkEmail: "nikhilesh24052002@gmail.com",
    paymentLinkPhone: "7771872012",
    paymentLinkReturnUrl: "https://digikosh.app/fees/status/",
    sessionStudent: "695e77da1f25102b2ad2d6bf",
    student: "695e77da1f25102b2ad2d6bc",
    section: "695e77551f25102b2ad2d674",
    classId: "695e774c1f25102b2ad2d666",
    session: "695e75ee1f25102b2ad2d5ff",
    parent: "68b30479489034e123047aa4",
    school: "695e75ae1f25102b2ad2d5f4",
    amount: 5000,
    amountPaid: 5000,
    currency: "INR",
    status: "paid",
    createdAt: new Date("2026-01-07T21:33:10.856+05:30"),
    updatedAt: new Date("2026-01-07T21:33:10.856+05:30"),
  };
  // Idempotency
  const exists = await getLedgerEventsCountService({
    externalRef: txn.paymentReferenceId,
  });
  if (exists) return;

  let remaining = txn.amountPaid;

  //Record raw payment
  await registerLedgerEventService({
    eventType: "PaymentReceived",
    amount: txn.amountPaid,
    studentId: txn.student,
    actorType: "gateway",
    actorId: txn.parent,
    externalRef: txn.paymentReferenceId,
    metaData: {
      school: txn.school,
      session: txn.session,
    },
  });

  // Get unpaid installments ordered by due date
  const installments = await getStudentFeeInstallmentsService(
    {
      student: txn.student,
      status: { $ne: "paid" },
    },
    {},
    { dueDate: 1 }
  );
  for (const inst of installments) {
    if (remaining <= 0) break;

    let due = inst.totalPayable + inst.lateFeeApplied - inst.amountPaid;

    const apply = Math.min(remaining, due);

    await registerLedgerEventService({
      eventType: "AdvanceAppliedToInstallment",
      amount: apply,
      studentId: txn.student,
      studentInstallmentId: inst._id,
      actorType: "system_cron",
      actorId: txn.school,
      metaData: {
        school: txn.school,
        session: txn.session,
      },
    });

    inst.amountPaid += apply;
    inst.status =
      inst.amountPaid >= inst.totalPayable + inst.lateFeeApplied
        ? "paid"
        : "partial";

    await updateStudentFeeInstallmentService(
      { _id: inst._id },
      { amountPaid: inst.amountPaid, status: inst.status }
    );

    remaining -= apply;
  }
  return;
}

//TODO need to test
export async function processRefund(txn) {
  await registerLedgerEventService({
    eventType: "RefundIssued",
    amount: txn.amountPaid,
    studentId: txn.student,
    actorType: "admin",
    actorId: txn.school,
    externalRef: txn.transactionId,
    metaData: {
      school: txn.school,
      session: txn.session,
    },
  });

  let refund = txn.amountPaid;

  const paidInst = await getStudentFeeInstallmentsService(
    {
      student: txn.student,
      amountPaid: { $gt: 0 },
    },
    {},
    { dueDate: -1 }
  );

  for (const inst of paidInst) {
    if (refund <= 0) break;

    const deduct = Math.min(refund, inst.amountPaid);
    inst.amountPaid -= deduct;
    inst.status = "partial";
    await inst.save();

    refund -= deduct;
  }
}

/** Calculation for Dashboard service */
/**
 * Todo
 * optimize aggregations
 * work on pending and overdue according to last week comparison
 */
export async function recalcDashboard(school, session) {
  school = "695e75ae1f25102b2ad2d5f4";
  session = "695e75ee1f25102b2ad2d5ff";
  const now = new Date();
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - 7);

  const lastWeekStart = new Date(now);
  lastWeekStart.setDate(now.getDate() - 14);

  const thisWeekEvents = await getLedgerEventsPipelineService([
    {
      $match: {
        "metaData.school": school,
        "metaData.session": session,
        eventTime: { $gte: thisWeekStart },
        eventType: {
          $in: ["PaymentReceived", "RefundIssued", "PaymentFailed"],
        },
      },
    },
    { $group: { _id: "$eventType", amount: { $sum: "$amount" } } },
  ]);
  const lastWeekEvents = await getLedgerEventsPipelineService([
    {
      $match: {
        "metaData.school": school,
        "metaData.session": session,
        eventTime: { $gte: lastWeekStart, $lt: thisWeekStart },
        eventType: {
          $in: ["PaymentReceived", "RefundIssued", "PaymentFailed"],
        },
      },
    },
    { $group: { _id: "$eventType", amount: { $sum: "$amount" } } },
  ]);

  const curWeekData = eventTotals(thisWeekEvents);
  const prevWeekData = eventTotals(lastWeekEvents);

  //total collected and refunded
  const events = await getLedgerEventsPipelineService([
    {
      $match: {
        "metaData.school": school,
        "metaData.session": session,
        eventType: {
          $in: ["PaymentReceived", "RefundIssued", "PaymentFailed"],
        },
      },
    },
    {
      $group: {
        _id: "$eventType",
        amount: { $sum: "$amount" },
      },
    },
  ]);

  let collected = 0,
    refunded = 0;

  for (const e of events) {
    if (e._id === "PaymentReceived") collected += e.amount;
    if (e._id === "RefundIssued") refunded += e.amount;
    if (e._id === "PaymentFailed") refunded += e.amount;
  }

  const [res] = await getStudentFeeInstallmentsPipelineService([
    {
      $match: {
        school: convertToMongoId(school),
        session: convertToMongoId(session),
      },
    },
    {
      $facet: {
        pending: [
          { $match: { status: { $in: ["pending", "partial"] } } },
          {
            $group: {
              _id: null,
              total: { $sum: { $subtract: ["$totalPayable", "$amountPaid"] } },
            },
          },
        ],
        overdue: [
          { $match: { status: "overdue" } },
          {
            $group: {
              _id: null,
              total: { $sum: { $subtract: ["$totalPayable", "$amountPaid"] } },
            },
          },
        ],
      },
    },
  ]);

  const [pending, overdue] = [
    res.pending[0]?.total || 0,
    res.overdue[0]?.total || 0,
  ];

  await updateFeeDashboardSnapshotService(
    { school: convertToMongoId(school), session: convertToMongoId(session) },
    {
      totals: {
        collected,
        refunded,
        pending,
        overdue,

        collectedChangePct: pct(curWeekData.collected, prevWeekData.collected),
        refundedChangePct: pct(curWeekData.refunded, prevWeekData.refunded),
        failedChangePct: pct(curWeekData.failed, prevWeekData.failed),
        // pendingChangePct: pct(pending.prev, pending.cur),
        // overdueChangePct: pct(overdue.prev, overdue.cur),
      },
      generatedAt: new Date(),
    },
    { upsert: true }
  );
  return;
}

function eventTotals(events) {
  let t = { collected: 0, refunded: 0, failed: 0 };

  for (const e of events) {
    if (e._id === "PaymentReceived") t.collected += e.amount;
    if (e._id === "RefundIssued") t.refunded += e.amount;
    if (e._id === "PaymentFailed") t.failed += e.amount;
  }
  return t;
}

function pct(cur, prev) {
  if (prev === 0 && cur > 0) return 100;
  if (prev === 0) return 0;
  return (((cur - prev) / prev) * 100).toFixed(2);
}
