"use strict";

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
import {
  getFeeDashboardSnapshotsService,
  updateFeeDashboardSnapshotService,
  getStudentFeeInstallmentDistinctService,
} from "./feeDashboardSnapshot.service.js";
import { convertToMongoId } from "../services/mongoose.services.js";
import { isLastDayOfMonth } from "../helpers/utils.helper.js";
import { getAdminsService } from "./admin.services.js";
import { getPaymentTransactionPipelineService } from "./paymentTransaction.service.js"
import dayjs from "dayjs";

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

//11-01-2026 afer zoho webhook call, creates ledger, manages installment
export async function processPayment(txn) {
  //todo confirm from Kuldeep
  // const testTxn = {
  //   _id: "695eadb092551c232e77e65e",
  //   paymentLinkId: "100000000091052",
  //   paymentLinkExpiresAt: new Date("2026-01-11T23:59:00.000+05:30"),
  //   paymentReferenceId: "REF-1767722056756-695e77da1f25102b2ad2d6bf-18354492",
  //   paymentInvoiceId: "INV-1767722056757-695e77da1f25102b2ad2d6bf-53763363",
  //   paymentLinkEmail: "nikhilesh24052002@gmail.com",
  //   paymentLinkPhone: "7771872012",
  //   paymentLinkReturnUrl: "https://digikosh.app/fees/status/",
  //   sessionStudent: "695e77da1f25102b2ad2d6bf",
  //   student: "695e77da1f25102b2ad2d6bc",
  //   section: "695e77551f25102b2ad2d674",
  //   classId: "695e774c1f25102b2ad2d666",
  //   session: "695e75ee1f25102b2ad2d5ff",
  //   parent: "68b30479489034e123047aa4",
  //   school: "695e75ae1f25102b2ad2d5f4",
  //   amount: 5000,
  //   amountPaid: 5000,
  //   currency: "INR",
  //   status: "paid",
  //   createdAt: new Date("2026-01-07T21:33:10.856+05:30"),
  //   updatedAt: new Date("2026-01-07T21:33:10.856+05:30"),
  // };
  // Idempotency
  const exists = await getLedgerEventsCountService({
    externalRef: txn?.paymentReferenceId,
  });
  if (exists) return;

  // let remaining = txn.amountPaid; //todo confirm from Kuldeep
  let remaining = txn.amount;

  //Record raw payment
  await registerLedgerEventService({
    eventType: "PaymentReceived",
    // amount: txn.amountPaid, //todo confirm from Kuldeep
    amount: txn.amount,
    studentId: txn.student,
    actorType: "gateway",
    actorId: txn.parent,
    externalRef: txn.paymentReferenceId,
    metaData: {
      school: convertToMongoId(txn.school),
      session: convertToMongoId(txn.session),
    },
  });

  // Get unpaid installments ordered by due date
  const installments = await getStudentFeeInstallmentsService(
    {
      session: txn.session,
      school: txn.school,
      student: txn.student,
      status: { $ne: "paid" },
    },
    { totalPayable: 1, lateFeeApplied: 1, amountPaid: 1, status: 1 },
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
        school: convertToMongoId(txn.school),
        session: convertToMongoId(txn.session),
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

//TODO need to test: Pending
export async function processRefund(txn) {
  await registerLedgerEventService({
    eventType: "RefundIssued",
    amount: txn.amountPaid,
    studentId: txn.student,
    actorType: "admin",
    actorId: txn.school,
    externalRef: txn.paymentReferenceId,
    metaData: {
      school: convertToMongoId(txn.school),
      session: convertToMongoId(txn.session),
    },
  });

  let refund = txn.amountPaid;

  //todo filter for month, dueDate, and installment Id
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
 * When a payment is processed, call this function,
 * Use for cron as well
 */
export async function recalcDashboard(school, session) {
  try {
    // let school = "695e75ae1f25102b2ad2d5f4";
    // let session = "695e75ee1f25102b2ad2d5ff";
    school = convertToMongoId(school);
    session = convertToMongoId(session);
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - 7);

    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(now.getDate() - 14);

    //TODO optimize later by using single facet pipeline
    const [
      thisWeekEvents,
      lastWeekEvents,
      thisWeekOverDueFees,
      lastWeekOverDueFees,
      thisWeekPendingFees,
      lastWeekPendingFees,
    ] = await Promise.all([
      getLedgerEventsPipelineService([
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
      ]),
      getLedgerEventsPipelineService([
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
      ]),
      //OverDue Amount Queries
      getStudentFeeInstallmentsPipelineService([
        {
          $match: {
            school: school,
            session: session,
            status: "overdue",
            $or: [
              { createdAt: { $gte: thisWeekStart } },
              { updatedAt: { $gte: thisWeekStart } },
            ],
          },
        },
        { $group: { _id: "Overdue", amount: { '$sum': {$subtract: ["$totalPayable","$amountPaid"] } } } },
      ]),
      getStudentFeeInstallmentsPipelineService([
        {
          $match: {
            school: school,
            session: session,
            status: "overdue",
            $or: [
              { createdAt: { $gte: lastWeekStart, $lt: thisWeekStart } },
              { updatedAt: { $gte: lastWeekStart, $lt: thisWeekStart } },
            ],
          },
        },
        { $group: { _id: "Overdue", amount: { '$sum': {$subtract: ["$totalPayable","$amountPaid"] } } } },
      ]),
      //Pending Amount Queries
      getStudentFeeInstallmentsPipelineService([
        {
          $match: {
            school: school,
            session: session,
            status: { $in: ["pending", "partial"] },
            $or: [
              { createdAt: { $gte: thisWeekStart } },
              { updatedAt: { $gte: thisWeekStart } },
            ],
          },
        },
        { '$group': { _id: 'Pending', amount: { '$sum': {$subtract: ["$totalPayable","$amountPaid"] } } }},
      ]),
      getStudentFeeInstallmentsPipelineService([
        {
          $match: {
            school: school,
            session: session,
            status: { $in: ["pending", "partial"] },
            $or: [
              { createdAt: { $gte: lastWeekStart, $lt: thisWeekStart } },
              { updatedAt: { $gte: lastWeekStart, $lt: thisWeekStart } },
            ],
          },
        },
        { '$group': { _id: 'Pending', amount: { '$sum': {$subtract: ["$totalPayable","$amountPaid"] } } }},
      ]),
    ]);

    const curWeekData = eventTotals([
      ...thisWeekEvents,
      ...thisWeekOverDueFees,
      ...thisWeekPendingFees,
    ]);
    const prevWeekData = eventTotals([
      ...lastWeekEvents,
      ...lastWeekOverDueFees,
      ...lastWeekPendingFees,
    ]);

    /** MONTHLY CALCULATIONS **/
    //total collected, failed and refunds for the Month
    const events = await getLedgerEventsPipelineService([
      {
        $match: {
          "metaData.school": convertToMongoId(school),
          "metaData.session": convertToMongoId(session),
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

    let { collected = 0, refunded = 0, failed = 0 } = eventTotals(events);

    const [result] = await getStudentFeeInstallmentsPipelineService([
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
                total: {
                  $sum: { $subtract: ["$totalPayable", "$amountPaid"] },
                },
              },
            },
          ],
          overdue: [
            { $match: { status: "overdue" } },
            {
              $group: {
                _id: null,
                total: {
                  $sum: { $subtract: ["$totalPayable", "$amountPaid"] },
                },
              },
            },
          ],
        },
      },
    ]);

    const [pending, overdue] = [
      result.pending[0]?.total || 0,
      result.overdue[0]?.total || 0,
    ];

    const updateObj = {
      totals: {
        collected,
        refunded,
        pending,
        overdue,
        failed,
        collectedChangePct: pct(curWeekData.collected, prevWeekData.collected),
        refundedChangePct: pct(curWeekData.refunded, prevWeekData.refunded),
        failedChangePct: pct(curWeekData.failed, prevWeekData.failed),
        pendingChangePct: pct(curWeekData.pending, prevWeekData.pending),
        overdueChangePct: pct(curWeekData.overdue, prevWeekData.overdue),
      },
      month: now.getMonth() + 1,
      isMonthEndRecord: isLastDayOfMonth(now),
    };

    await updateFeeDashboardSnapshotService(
      {
        school: convertToMongoId(school),
        session: convertToMongoId(session),
        generatedAt: { $gte: dayStart, $lt: dayEnd },
      },
      updateObj,
      { upsert: true }
    );

    console.log("recalcDashboard completed successfully for school:", school);
    return;
  } catch (error) {
    console.log("recalcDashboard Failed:", error.message);
  }
}

/**
 *
 * @param {*} events  array of _Id and amount
 * @param {*} t default key value like {collected: 0}, {collected: 0, refunded: 0}
 * @returns
 */
function eventTotals(events) {
  let t = { collected: 0, refunded: 0, failed: 0, overdue: 0, pending: 0 };
  for (const e of events) {
    if (e._id === "PaymentReceived") t.collected += e.amount;
    if (e._id === "RefundIssued") t.refunded += e.amount;
    if (e._id === "PaymentFailed") t.failed += e.amount;
    if (e._id === "Pending") t.pending += e.amount;
    if (e._id === "Overdue") t.overdue += e.amount;
  }
  return t;
}

function pct(cur, prev) {
  if (prev === 0 && cur > 0) return 100;
  if (prev === 0) return 0;
  return (((cur - prev) / prev) * 100).toFixed(2);
}

// 1. new school
//   create data with default values
// 2. cron job in evening/ night
export async function storeDailySnapshot(req, res) {
  try {
    let { session } = req.query;
    session = convertToMongoId(session);
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );
    /**
     /get all active schools in a session
     * Loop through schools
     /TODO kuldeep add active session check
     */
    const schoolsWithSnapshotsToday =
      await getStudentFeeInstallmentDistinctService("school", {
        session,
        generatedAt: {
          $gte: dayStart,
          $lt: dayEnd,
        },
      });
    // Get ALL schools, TODO kuldeep add session filter
    //if dashboard data is generated, then skip, else call recalcDashboard for the schools
    const remainingSchools = await getAdminsService(
      {
        _id: { $nin: schoolsWithSnapshotsToday },
        isActive: true,
        status: "verified",
      },
      { _id: -1 }
    );
    for (let school of remainingSchools) {
        await recalcDashboard(school._id.toString(), session.toString());
    }
    //remove after testing
    return res.status(200).json({
      // data,
      data: {},
      message: `StoreDailySnapshot completed successfully For schools: ${remainingSchools.length}`,
    });
  } catch (err) {
    console.error("storeDailySnapshot Error:", err?.message);
    return res.status(500).json({
      message: err?.message,
    });
  }
}
// 3. payment process, when a payment is done/failed, update data in dashboard data
