import mongoose from "mongoose";
import studentModel from "../models/student.model.js";
import studentFeeDueModel from "../models/fee/studentFeeDue.model.js";

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
  const step = monthsForFrequency(feeCycle.frequency);
  const now = new Date();
  let candidate = new Date(now.getFullYear(), now.getMonth(), feeCycle.dueDate);
  if (candidate < now) {
    // advance until candidate >= now
    while (candidate < now) {
      candidate = new Date(
        candidate.getFullYear(),
        candidate.getMonth() + step,
        feeCycle.dueDate,
      );
    }
  }

  return candidate;
}

export async function createOrUpdateDuesForFeeStructure(
  feeStructure,
  feeCycle,
  session,
) {
  const adminId = feeStructure.adminId;
  const sessionId = feeStructure.sessionId;
  const classId = feeStructure.classId;
  const feeStructureId = feeStructure._id;
  const feeCycleId = feeStructure.feeCycleId;

  // fetch students in these sections for the session & class
  const studentFilter = {
    adminId,
    sessionId,
    classId,
  };

  const students = await studentModel.find(studentFilter).lean();
  if (!students || students.length === 0) return { created: 0, updated: 0 };

  // prepare a map for fee amounts per section
  // handle the case where all sections have same fee heads & amounts - 
  // in that case, applicableSections will have one entry with empty sectionId, 
  // so all students will be mapped to that entry.


  // what will happen when we onboard the schools in middle of session? start from the upcomming month
  if (feeStructure.amountForAllSections) {
    const sectionMap = new Map();
    (feeStructure.applicableSections || []).forEach((appSec) => {
      sectionMap.set(String(appSec.section.sectionId), appSec.feeHeads || []);
    });
  }

  const dueDate = computeNextDueDate(feeCycle);

  const operations = [];

  for (const student of students) {
    const sid = String(student._id);
    const secId = String(student.sectionId || student.section || "");

    const feeHeadsForSection = sectionMap.get(secId) || [];

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
      result = await studentFeeDueModel.bulkWrite(operations, { session });
    });

    return result;
  } finally {
    transaction.endSession();
  }
}
