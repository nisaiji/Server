import { StatusCodes } from "http-status-codes";
import { getSchoolFeeStructureService } from "../../services/feeStructure/schoolFeeStructure.services.js";
import { getSessionService } from "../../services/session.services.js";
import { error, success } from "../../utills/responseWrapper.js";
import { getClassService } from "../../services/class.sevices.js";
import { createSectionFeeStructureService, getSectionFeeStructureService } from "../../services/feeStructure/sectionFeeStructure.services.js";
import { createFeeInstallmentService } from "../../services/feeStructure/feeInstallment.service.js";
import { getSectionService } from "../../services/section.services.js";

export async function createSectionFeeStructureController(req, res) {
  try {
    const {sectionsFee, title, description, totalAmount, schoolFeeStructureId, classId, sessionId } = req.body;
    const adminId = req.adminId;
    const session = await getSessionService({ _id: sessionId });
    if (!session || session['status'] === 'completed') {
      return res.status(StatusCodes.BAD_REQUEST).send(error(404, "Session completed!"));
    }

    const classInfo = await getClassService({ _id: classId });
    if (!classInfo) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(404, "Class not found!"));
    }
    let sectionFeeStructure = await getSectionFeeStructureService({ classId, session: sessionId, school: adminId });
    if (sectionFeeStructure) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Fee Structure already exists!"));
    }
    let schoolFeeStructure = await getSchoolFeeStructureService({ _id: schoolFeeStructureId, session: sessionId, school: adminId });
    if (!schoolFeeStructure) {
      return res.status(StatusCodes.NOT_FOUND).send(error(400, "School fee structure not found"));
    }

    for (const sectionFeeObj of sectionsFee) {
      const section = await getSectionService({_id: sectionFeeObj.sectionId, admin: adminId, class: classId});
      if(!section) {
        continue;
      }
      const feeStructurePayload = {
        title: title ? title : `Fee-structure-section-${section.name}-class-${classInfo.name}-session-${session.academicStartYear}-${session.academicEndYear}`,
        description,
        classId,
        session: sessionId,
        totalAmount,
        section: sectionFeeObj.sectionId,
        school: adminId
      };

      const newFeeStructure = await createSectionFeeStructureService(feeStructurePayload);

      let installmentNumber = 1;
      for (const installment of sectionFeeObj.feeInstallments) {
        const feeInstallmentPayload = {
          sectionFeeStructure: newFeeStructure._id,
          installmentNumber: installmentNumber++,
          startDate: installment.startDate,
          dueDate: installment.dueDate,
          amount: installment.amount
        };
        await createFeeInstallmentService(feeInstallmentPayload);
      }
    }

    return res.status(StatusCodes.CREATED).send(success(201, { message: "Fee structure created successfully"}));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getSchoolFeeStructureController(req, res) {
  try {
    const { sessionId } = req.body;
    const adminId = req.adminId;

    const schoolFeeStructure = await getSchoolFeeStructureService({ school: adminId, session: sessionId });
    if (!schoolFeeStructure) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "School fee structure not found"));
    }
    return res.status(StatusCodes.OK).send(success(200, schoolFeeStructure));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
} 