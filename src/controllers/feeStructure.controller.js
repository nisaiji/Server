import { StatusCodes } from "http-status-codes"
import { error, success } from "../utills/responseWrapper.js"
import { getSessionService } from "../services/session.services.js";
import { getClassService } from "../services/class.sevices.js";
import { createFeeStructureService, getFeeStructureService } from "../services/feeStructure.service.js";
import { createFeeInstallmentService } from "../services/feeInstallment.service.js";

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


