import feeInstallmentModel from "../../models/feeStructure/feeInstallment.model.js";
import dayjs from 'dayjs';

export async function getFeeInstallmentService(paramObj, projection = {}) {
  try {
    const feeInstallment = await feeInstallmentModel.findOne(paramObj);
    return feeInstallment;
  } catch (error) {
    throw error;
  }
}

export async function createFeeInstallmentService(data) {
  try {
    const feeInstallment = await feeInstallmentModel.create(data);
    return feeInstallment;
  } catch (error) {
    throw error;
  }
}

export async function createFeeInstallmentsService(data) {
  try {
    const feeInstallments = await feeInstallmentModel.insertMany(data)
    return feeInstallments;
  } catch (error) {
    throw error;
  }
}

export async function getFeeInstallmentsService(
  filter,
  projection = {},
  sortingLogic
) {
  try {
    console.log("filter", filter);
    const studentFeeInstallments = await feeInstallmentModel
      .find(filter)
      .select(projection)
      .sort(sortingLogic);
    return studentFeeInstallments;
  } catch (error) {
    throw error;
  }
}

export async function deleteFeeInstallmentService(paramObj) {
  try {
    const feeInstallment = await feeInstallmentModel.deleteOne(paramObj);
    return feeInstallment;
  } catch (error) {
    throw error;
  }
}

export async function updateFeeInstallmentService(filter, update) {
  try {
    const feeInstallment = await feeInstallmentModel.findOneAndUpdate(filter, update);
    return feeInstallment;
  } catch (error) {
    throw error;
  }
}

export async function getFeeInstallmentsPipelineService(pipeline) {
  try {
    const feeInstallment = await feeInstallmentModel.aggregate(pipeline).exec();
    return feeInstallment;
  } catch (error) {
    throw error;
  }
}

export async function getFeeInstallmentCountService(filter) {
  try {
    const count = await feeInstallmentModel.countDocuments(filter);
    return count;
  } catch (error) {
    throw error;
  }
}


export async function getNextDate(current, frequency) {
  switch (frequency) {
    case 'monthly':
      return dayjs(current).add(1, 'month').toDate();
    case 'bimonthly':
      return current.add(2, 'month');
    case 'quarterly':
      return current.add(3, 'month');
    case 'half-yearly':
      return current.add(6, 'month');
    case 'annually':
      return current.add(1, 'year');
    default:
      throw new Error(`Unsupported frequency: ${frequency}`);
  }
}

/**
* Generate installments for a student from a FeeStructure.
* Called when admin assigns fee to an active student.
*/

// export async function createInstallmentsForStudent({ studentId, feeStructureId }) {
//   const fs = await feeStructureModel.findById({_id: feeStructureId});
//   if (!fs) throw new Error('Fee structure not found');
//   const installments = [];
//   let cursor = dayjs(fs.startDate).startOf('day');
//   const end = dayjs(fs.endDate).startOf('day');
//   while (cursor.isBefore(end) || cursor.isSame(end)) {
//     const dueDate = cursor.toDate();
//     installments.push({
//       studentId,
//       feeStructure: fs._id,
//       academicYearId: fs.academicYearId,
//       dueDate,
//       amount: fs.baseAmount,
//       // frequency: fs.frequency, check if needed outside or not
//       lockedPrincipal: false,
//       metadata: {
//         classId: fs.classId,
//         sectionId: fs.sectionId,
//         frequency: fs.frequency,
//       },
//     });
//     cursor = getNextDate(cursor, fs.frequency);
//   }
//   await feeInstallmentModel.insertMany(installments);
//   return installments;
// }