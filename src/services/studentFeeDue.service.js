import mongoose from "mongoose";
import { getFeeCycleService, getFeeHeadService } from "./feeSetup.service.js";
import studentFeeDueModel from "../models/fee/studentFeeDue.model.js";
import paymentModel from "../models/payments/payment.model.js";
import sessionModel from "../models/session.model.js";
import sessionStudentModel from "../models/sessionStudent.model.js";
import { getSessionService } from "../services/session.services.js";
function monthsForFrequency(freq) {
  switch (freq) {
    case "MONTHLY":
      return 1;
    case "BY_MONTHLY":
      return 2;
    case "QUARTERLY":
      return 3;
    case "HALF_YEARLY":
      return 6;
    case "YEARLY":
      return 12;
    default:
      return 1;
  }
}

function getAllDueDatesInSession(session, feeCycle) {
  const frequency = monthsForFrequency(feeCycle.frequency);
  const dates = [];
  let current = new Date();

  let dueDate = new Date(
    current.getFullYear(),
    current.getMonth(),
    feeCycle.dueDate
  );

  while (dueDate < current) {
    dueDate = new Date(
      dueDate.getFullYear(),
      dueDate.getMonth() + frequency,
      feeCycle.dueDate
    );
  }

  while (dueDate <= session.endDate) {
    dates.push(new Date(dueDate));
    dueDate = new Date(
      dueDate.getFullYear(),
      dueDate.getMonth() + frequency,
      feeCycle.dueDate
    );
  }

  return dates;
}

function getStudentFilter(feeStructure, studentSessionId) {
  const baseFilter = {
    school: feeStructure.adminId,
    session: feeStructure.sessionId,
    classId: feeStructure.classId
  };

  return studentSessionId ? { _id: studentSessionId } : baseFilter;
}

function buildSectionMap(feeStructure) {
  const sectionMap = new Map();

  if (!feeStructure.amountForAllSections) {
    (feeStructure.applicableSections || []).forEach((appSec) => {
      sectionMap.set(String(appSec.section.sectionId), appSec.feeHeads || []);
    });
  }

  return sectionMap;
}

function buildFeeHeadTypeMap(feeHeadsDetails) {
  const feeHeadTypeMap = new Map();

  if (feeHeadsDetails && Array.isArray(feeHeadsDetails.feeHeads)) {
    feeHeadsDetails.feeHeads.forEach((head) => {
      feeHeadTypeMap.set(String(head._id), head.type);
    });
  }

  return feeHeadTypeMap;
}

function buildFeeBreakup(feeHeadsForSection, feeHeadTypeMap, includeOneTime) {
  return (feeHeadsForSection || []).map((feeHead) => {
    const type = feeHeadTypeMap.get(String(feeHead.feeHeadId));

    if (type === "ONE_TIME" && !includeOneTime) {
      return {
        feeHeadId: feeHead.feeHeadId,
        amount: 0
      };
    }

    return {
      feeHeadId: feeHead.feeHeadId,
      amount: feeHead.amount || 0
    };
  });
}

function buildUpdateOperation({
  adminId,
  studentId,
  feeStructureId,
  feeCycleId,
  sessionId,
  dueDate,
  feeBreakup,
  totalAmount
}) {
  return {
    updateOne: {
      filter: {
        adminId,
        studentId,
        feeStructureId,
        feeCycleId,
        sessionId,
        dueDate
      },
      update: {
        $set: {
          feeBreakup,
          totalAmount,
          dueDate,
          status: "PENDING"
        }
      },
      upsert: true
    }
  };
}

function buildFeeDueOperations({
  studentsInCurrentSession,
  dueDates,
  academicSession,
  feeStructure,
  sectionMap,
  feeHeadTypeMap,
  adminId,
  sessionId,
  feeStructureId,
  feeCycleId
}) {
  const operations = [];

  for (const student of studentsInCurrentSession) {
    const secId = String(student.sectionId || student.section || "");
    const feeHeadsForSection =
      sectionMap.get(secId) ?? feeStructure.applicableSections[0].feeHeads;

    for (const dueDate of dueDates) {
      const includeOneTime =
        dueDate.getMonth() === academicSession.startDate.getMonth() &&
        dueDate.getFullYear() === academicSession.startDate.getFullYear();
      const feeBreakup = buildFeeBreakup(
        feeHeadsForSection,
        feeHeadTypeMap,
        includeOneTime
      );
      const totalAmount = feeBreakup.reduce(
        (sum, item) => sum + item.amount,
        0
      );

      operations.push(
        buildUpdateOperation({
          adminId,
          studentId: student.student,
          feeStructureId,
          feeCycleId,
          sessionId,
          dueDate,
          feeBreakup,
          totalAmount
        })
      );
    }
  }

  return operations;
}

/**
 * @param {Object} feeStructure
 * @param {string|import("mongoose").Types.ObjectId|undefined} studentSessionId
 * @param {import("mongoose").ClientSession|undefined} dbTransactionInstance
 */
export async function createOrUpdateDuesForFeeStructure(
  feeStructure,
  studentSessionId,
  dbTransactionInstance
) {
  console.log("createOrUpdateDuesForFeeStructure called");
  const adminId = feeStructure.adminId;
  const sessionId = feeStructure.sessionId;
  const feeStructureId = feeStructure._id;
  const feeCycleId = feeStructure.feeCycleId;

  const studentFilter = getStudentFilter(feeStructure, studentSessionId);
  const studentsInCurrentSession = await sessionStudentModel
    .find(studentFilter)
    .session(dbTransactionInstance)
    .lean();

  if (!studentsInCurrentSession || studentsInCurrentSession.length === 0) {
    return { created: 0, updated: 0 };
  }

  const [academicSession, feeCycle, feeHeadsDetails] = await Promise.all([
    getSessionService({
      _id: sessionId,
      school: adminId
    }),
    getFeeCycleService({
      _id: feeCycleId,
      adminId
    }),
    getFeeHeadService({ adminId, sessionId })
  ]);

  const sectionMap = buildSectionMap(feeStructure);
  const dueDates = getAllDueDatesInSession(academicSession, feeCycle);

  const feeHeadTypeMap = buildFeeHeadTypeMap(feeHeadsDetails);

  const operations = buildFeeDueOperations({
    studentsInCurrentSession,
    dueDates,
    academicSession,
    feeStructure,
    sectionMap,
    feeHeadTypeMap,
    adminId,
    sessionId,
    feeStructureId,
    feeCycleId
  });

  if (operations.length === 0) {
    return { created: 0, updated: 0 };
  }

  if (!dbTransactionInstance) {
    const transaction = await mongoose.startSession();
    try {
      await transaction.withTransaction(async () => {
        await studentFeeDueModel.bulkWrite(
          /** @type {import("mongoose").AnyBulkWriteOperation[]} */ (
            operations
          ),
          {
            session: transaction
          }
        );
      });
    } finally {
      transaction.endSession();
    }
  } else {
    await studentFeeDueModel.bulkWrite(
      /** @type {import("mongoose").AnyBulkWriteOperation[]} */ (operations),
      {
        session: dbTransactionInstance
      }
    );
  }
}

export async function getStudentFeeDuesService({
  studentId,
  sessionId,
  adminId
}) {
  const dues = await studentFeeDueModel
    .find({ studentId, sessionId, adminId })
    .lean();

  if (!dues.length) return [];

  const feeHeadGroup = await getFeeHeadService({ adminId, sessionId });
  const feeHeadMap = new Map(
    (feeHeadGroup?.feeHeads || []).map((fh) => [String(fh._id), fh])
  );

  const paidDues = dues.filter((d) => d.status === "PAID");
  const dueToPaymentMap = new Map();

  if (paidDues.length > 0) {
    const paidDueIds = paidDues.map((d) => d._id);
    const payments = await paymentModel
      .find({ feeDueIds: { $in: paidDueIds }, status: "SUCCESS" })
      .lean();
    for (const paidDueId of paidDueIds) {
      const payment = payments.find((p) =>
        p.feeDueIds.some((id) => id.equals(paidDueId))
      );
      if (payment) {
        dueToPaymentMap.set(String(paidDueId), {
          id: payment._id,
          mode: payment.paymentMethod,
          transactionId: payment.paymentSessionId,
          paidAt: payment.statusUpdatedAt
        });
      }
    }
  }

  // if status is PAID then provide the id, mode, transaction id, paid AT
  return dues.map((due) => {
    const dueObj = {
      ...due,
      feeBreakup: due.feeBreakup.map((item) => {
        const feeHead = feeHeadMap.get(String(item.feeHeadId));
        return {
          feeHeadId: item.feeHeadId,
          amount: item.amount,
          ...(feeHead && {
            name: feeHead.name,
            label: feeHead.label,
            type: feeHead.type,
            refundable: feeHead.refundable
          })
        };
      })
    };

    if (due.status === "PAID") {
      const paymentDetails = dueToPaymentMap.get(String(due._id));
      if (paymentDetails) {
        dueObj["paymentDetails"] = paymentDetails;
      }
    }

    return dueObj;
  });
}

export async function getSchoolCollectionsService({
  adminId,
  sessionId,
  classId,
  sectionId,
  search,
  page = 1,
  limit = 10
}) {
  let targetSessionId = sessionId;
  if (!targetSessionId) {
    const currentSession = await sessionModel
      .findOne({ school: adminId, isCurrent: true })
      .lean();
    if (currentSession) {
      targetSessionId = currentSession._id;
    } else {
      const latestSession = await sessionModel
        .findOne({ school: adminId })
        .sort({ startDate: -1 })
        .lean();
      if (latestSession) {
        targetSessionId = latestSession._id;
      }
    }
  }

  if (!targetSessionId) {
    throw new Error("No active academic session found for this school.");
  }

  const adminObjId = new mongoose.Types.ObjectId(adminId);
  const sessionObjId = new mongoose.Types.ObjectId(targetSessionId);

  const matchStage = {
    school: adminObjId,
    session: sessionObjId,
    isActive: true
  };

  if (classId && mongoose.Types.ObjectId.isValid(classId)) {
    matchStage.classId = new mongoose.Types.ObjectId(classId);
  }

  if (sectionId && mongoose.Types.ObjectId.isValid(sectionId)) {
    matchStage.section = new mongoose.Types.ObjectId(sectionId);
  }

  // 1. Overview stats: aggregate over all matching session students
  const overviewPipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "student_fee_dues",
        let: { studentId: "$student", sessionId: "$session" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$studentId", "$$studentId"] },
                  { $eq: ["$sessionId", "$$sessionId"] }
                ]
              }
            }
          }
        ],
        as: "dues"
      }
    },
    { $unwind: "$dues" },
    {
      $group: {
        _id: null,
        totalPayable: { $sum: "$dues.totalAmount" },
        collectedAmount: {
          $sum: {
            $cond: [{ $eq: ["$dues.status", "PAID"] }, "$dues.totalAmount", 0]
          }
        },
        outstandingDues: {
          $sum: {
            $cond: [
              { $in: ["$dues.status", ["PENDING", "OVERDUE"]] },
              "$dues.totalAmount",
              0
            ]
          }
        }
      }
    }
  ];

  const overviewResult = await sessionStudentModel.aggregate(overviewPipeline);
  const overview = overviewResult[0] || {
    totalPayable: 0,
    collectedAmount: 0,
    outstandingDues: 0
  };

  // 2. Student List with Search and Pagination
  const studentListPipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "students",
        localField: "student",
        foreignField: "_id",
        as: "studentDoc"
      }
    },
    { $unwind: "$studentDoc" }
  ];

  if (search) {
    const searchRegex = new RegExp(search, "i");
    studentListPipeline.push({
      $match: {
        $or: [
          { "studentDoc.firstName": searchRegex },
          { "studentDoc.lastName": searchRegex },
          {
            $expr: {
              $regexMatch: {
                input: {
                  $concat: [
                    "$studentDoc.firstName",
                    " ",
                    "$studentDoc.lastName"
                  ]
                },
                regex: search,
                options: "i"
              }
            }
          }
        ]
      }
    });
  }

  // Count matches
  const countPipeline = [...studentListPipeline, { $count: "total" }];
  const countResult = await sessionStudentModel.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  // Add the remaining projection & pagination stages
  studentListPipeline.push(
    {
      $lookup: {
        from: "classes",
        localField: "classId",
        foreignField: "_id",
        as: "classDoc"
      }
    },
    { $unwind: { path: "$classDoc", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "sections",
        localField: "section",
        foreignField: "_id",
        as: "sectionDoc"
      }
    },
    { $unwind: { path: "$sectionDoc", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "student_fee_dues",
        let: { studentId: "$student", sessionId: "$session" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$studentId", "$$studentId"] },
                  { $eq: ["$sessionId", "$$sessionId"] }
                ]
              }
            }
          }
        ],
        as: "dues"
      }
    },
    {
      $addFields: {
        totalPayable: { $sum: "$dues.totalAmount" },
        collected: {
          $sum: {
            $map: {
              input: "$dues",
              as: "d",
              in: {
                $cond: [{ $eq: ["$$d.status", "PAID"] }, "$$d.totalAmount", 0]
              }
            }
          }
        },
        outstanding: {
          $sum: {
            $map: {
              input: "$dues",
              as: "d",
              in: {
                $cond: [
                  { $in: ["$$d.status", ["PENDING", "OVERDUE"]] },
                  "$$d.totalAmount",
                  0
                ]
              }
            }
          }
        }
      }
    },
    {
      $lookup: {
        from: "payments",
        let: { sessionStudentId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$sessionStudentId", "$$sessionStudentId"] }
            }
          },
          { $sort: { updatedAt: -1 } },
          { $limit: 1 }
        ],
        as: "latestPayment"
      }
    },
    { $unwind: { path: "$latestPayment", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        sessionStudentId: "$_id",
        studentName: {
          $concat: ["$studentDoc.firstName", " ", "$studentDoc.lastName"]
        },
        class: "$classDoc.name",
        classId: "$classDoc._id",
        section: "$sectionDoc.name",
        sectionId: "$sectionDoc._id",
        totalPayable: 1,
        collected: 1,
        outstanding: 1,
        latestActivityStatus: {
          $cond: {
            if: { $not: ["$latestPayment"] },
            then: "N/A",
            else: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$latestPayment.status", "SUCCESS"] },
                    then: "Succeeded"
                  },
                  {
                    case: { $eq: ["$latestPayment.status", "FAILED"] },
                    then: "Failed"
                  },
                  {
                    case: { $eq: ["$latestPayment.status", "PENDING"] },
                    then: "Pending"
                  },
                  {
                    case: { $eq: ["$latestPayment.status", "CREATED"] },
                    then: "Created"
                  },
                  {
                    case: { $eq: ["$latestPayment.status", "CANCELLED"] },
                    then: "Cancelled"
                  },
                  {
                    case: { $eq: ["$latestPayment.status", "EXPIRED"] },
                    then: "Expired"
                  }
                ],
                default: "$latestPayment.status"
              }
            }
          }
        },
        lastActivityDate: {
          $cond: {
            if: { $not: ["$latestPayment"] },
            then: null,
            else: "$latestPayment.updatedAt"
          }
        }
      }
    },
    { $sort: { studentName: 1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit }
  );

  const students = await sessionStudentModel.aggregate(studentListPipeline);

  return {
    overview,
    students,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}
