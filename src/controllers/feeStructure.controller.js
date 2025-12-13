import { StatusCodes } from "http-status-codes"
import { error, success } from "../utills/responseWrapper.js"
import { getSessionService } from "../services/session.services.js";
import { getClassService } from "../services/class.sevices.js";
import { createFeeStructureService, getFeeStructureService, getFeeStructuresPipelineService } from "../services/feeStructure.service.js";
import { createFeeInstallmentService } from "../services/feeInstallment.service.js";
import { getSessionStudentService } from "../services/v2/sessionStudent.service.js";
import { getSectionService } from "../services/section.services.js";
import { getAdminService } from "../services/admin.services.js";
import { getPaymentTransactionService } from "../services/paymentTransaction.service.js";

export async function createFeeStructureController(req, res) {
  try {
    const {sectionsFee, classId, sessionId, totalAmount, lateFee} = req.body;
    const adminId = req.adminId;
    const session = await getSessionService({_id: sessionId});
    if(!session || session['status']==='completed') {
      return res.status(StatusCodes.BAD_REQUEST).send(error(404, "Session completed!")); 
    }
    const classInfo = await getClassService({_id: classId});
    if(!classInfo) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(404, "Class not found!")); 
    }
    const feeStructure = await getFeeStructureService({classId, sessionId});
    if(feeStructure) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Fee Structure already exists!")); 
    }

    // create section wise fee
    for(const sectionFeeObj of sectionsFee) {
         const feeStructurePayload = {
            name: `Fee-Structure-Class-${classInfo.name}-session-${session.academicStartYear}-${session.academicEndYear}`,
            classId,
            session: sessionId,
            totalAmount,
            lateFee,
            section: sectionFeeObj.sectionId,
            school: adminId,
            installmentType: sectionFeeObj.installmentType,
          };

          const newFeeStructure = await createFeeStructureService(feeStructurePayload);

          let installmentNumber=1;
          for(const installment of sectionFeeObj.feeInstallments) {
            const feeInstallmentPayload = {
              feeStructure: newFeeStructure._id,
              installmentNumber: installmentNumber++,
              dueDate: installment.dueDate,
              amount: installment.amount
            };
            await createFeeInstallmentService(feeInstallmentPayload);
          }
    }
    return res.status(StatusCodes.CREATED).send(success(201, {message: "Fee Structure created successfully"}));

  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getFeeStructureController(req, res) {
  try {
    const {sessionStudentId} = req.params;
    const sessionStudent = await getSessionStudentService({_id: sessionStudentId  });
    if(!sessionStudent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session Student not found"));
    }
    const session = await getSessionService({_id: sessionStudent.session});
    if(!session || session['status']==='completed') {
      return res.status(StatusCodes.BAD_REQUEST).send(error(404, "Session completed!")); 
    }
    const [section, classInfo, school] = await Promise.all([
      getSectionService({_id: sessionStudent.section}),
      getClassService({_id: sessionStudent.classId}),
      getAdminService({_id: sessionStudent.school})
    ]);

    if(!section) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Section not found"));
    }                   
    if(!classInfo) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Class not found"));
    }

    const feeStructure = await getFeeStructureService({
      session: session['_id'],
      classId: classInfo._id,
      section: section._id,
      school: school._id
    });
    if(!feeStructure) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Fee Structure not found"));
    }
    const pipeline = [
      {
        $match: { _id: feeStructure._id }
      },
      {
        $lookup: {
          from: 'feeinstallments',
          localField: '_id',
          foreignField: 'feeStructure',
          as: 'installments'
        }
      }
    ];

    const feeStructureWithInstallments = await getFeeStructuresPipelineService(pipeline);
    const studentFeeStructureInstallments = feeStructureWithInstallments[0]?.installments?.map(installment => {
      const isPaid = isInstallementPaid(installment._id, feeStructure._id, sessionStudentId);
      return {
        ...installment,
        isPaid,
        totalLateFee: !isPaid ? calculateLateFee(feeStructure.lateFee, installment.dueDate) : 0
      }
    });

    feeStructureWithInstallments['installments'] = studentFeeStructureInstallments;
    console.log({feeStructureWithInstallments});
    return res.status(StatusCodes.OK).send(success(200, studentFeeStructureInstallments));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

async function isInstallementPaid(installmentId, feeStructureId, sessionStudentId) {
  try {
    const paymentTransaction = await getPaymentTransactionService({
      feeInstallment: installmentId,
      feeStructure: feeStructureId,
      sessionStudent: sessionStudentId,
      status: 'paid'
    });
    if(paymentTransaction) {
      return true;
    }
    return false;
  } catch (error) {
    throw error;
  }
}

function calculateLateFee(lateFeePerDay, dueDate) {
  const currentDate = new Date();
  const due = new Date(dueDate);
  if(currentDate > due) {
    const diffTime = Math.abs(currentDate - dueDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return lateFeePerDay * diffDays;
  }
  return 0;
}