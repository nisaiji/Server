import mongoose from "mongoose";
import studentModel from "../models/student.model.js";
import studentFeeDueModel from "../models/fee/studentFeeDue.model.js";
import { getSessionService } from "./session.services.js";
import { getFeeCycleService } from "./feeSetup.service.js";
import { getFeeStructureService } from "./feeSetup.service.js";
import sessionStudentModel from "../models/v2/sessionStudent.model.js";

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

function computeNextDueDate(feeCycle) {
  // feeCycle.dueDate is expected to be day-of-month (1-28)
  const frequency = monthsForFrequency(feeCycle.frequency);
  const now = new Date();
  let candidate = new Date(now.getFullYear(), now.getMonth(), feeCycle.dueDate);
  if (candidate < now) {
    // advance until candidate >= now
    while (candidate < now) {
      candidate = new Date(
        candidate.getFullYear(),
        candidate.getMonth() + frequency,
        feeCycle.dueDate,
      );
    }
  }

  return candidate;
}

export async function createOrUpdateDuesForFeeStructure(
  feeStructure,
  studentId,
) {
  const adminId = feeStructure.adminId;
  const sessionId = feeStructure.sessionId;
  const classId = feeStructure.classId;
  const feeStructureId = feeStructure._id;
  const feeCycleId = feeStructure.feeCycleId;

  const [session, feeCycle] = await Promise.all([
    getSessionService({
      _id: sessionId,
      school: adminId,
    }),
    getFeeCycleService({
      _id: feeCycleId,
      adminId,
    }),
  ]);

  // fetch students in these sections for the session & class
  // if new student is added in middle of session
  const studentFilter = studentId
    ? { studentId, adminId, sessionId, classId }
    : {
        adminId,
        sessionId,
        classId,
      };

  const studentsInCurrentSession = await sessionStudentModel
    .find(studentFilter)
    .lean();
  console.log("studentsInCurrentSession", studentsInCurrentSession);
  if (!studentsInCurrentSession || studentsInCurrentSession.length === 0) return { created: 0, updated: 0 };

  console.log("studentsInCurrentSession", studentsInCurrentSession);

  // prepare a map for fee amounts per section
  // handle the case where all sections have same fee heads & amounts -
  // in that case, applicableSections will have one entry with empty sectionId,
  // so all students will be mapped to that entry.

  // what will happen when we onboard the schools in middle of session? start from the upcoming month.
  // if new student is added need to handle that cases
  if (!feeStructure.amountForAllSections) {
    const sectionMap = new Map();
    (feeStructure.applicableSections || []).forEach((appSec) => {
      sectionMap.set(String(appSec.section.sectionId), appSec.feeHeads || []);
    });
  }

  const dueDate = computeNextDueDate(feeCycle);

  const operations = [];

  // get fee head details
  const feeHeadsDetails = await getFeeHeadService({
    adminId,
    sessionId,
  });

  console.log(feeHeadsDetails, "feeHeadsDetails");

  // if session start month and fee month month is same then onetime fee due will apply but
  // if session start month and fee month is not same then one time fee will not apply on recurring fee due apply

  for (const student of studentsInCurrentSession) {
    const sid = String(student.studentId || student.student || "");
    const secId = String(student.sectionId || student.section || "");

    const feeHeadsForSection =
      sectionMap.get(secId) ?? feeStructure.applicableSections[0].feeHeads;

    const feeBreakup = feeHeadsForSection.map((fh) => ({
      feeHeadId: fh.feeHeadId,
      amount: fh.amount || 0,
    }));
    const totalAmount = feeBreakup.reduce((s, f) => s + (f.amount || 0), 0);

    const filter = {
      adminId,
      studentId: student._id,
      feeStructureId,
      feeCycleId,
      sessionId,
    };

    const update = {
      $set: {
        feeBreakup,
        totalAmount,
        dueDate,
        status: "PENDING",
      },
    };

    operations.push({ updateOne: { filter, update, upsert: true } });
  }

  if (operations.length === 0) return { created: 0, updated: 0 };

  const transaction = await mongoose.startSession();
  try {
    let result;
    await transaction.withTransaction(async () => {
      await studentFeeDueModel.bulkWrite(operations, { session });
    });
  } finally {
    transaction.endSession();
  }
}
