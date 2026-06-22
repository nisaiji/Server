import mongoose from "mongoose";

import { getFeeCycleService } from "./feeSetup.service.js";
import { getFeeHeadService } from "./feeSetup.service.js";
import sessionStudentModel from "../models/sessionStudent.model.js";

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

  return dues.map((due) => ({
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
  }));
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
