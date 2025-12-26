import { StatusCodes } from "http-status-codes";
import { getSchoolFeeStructureService } from "../../services/feeStructure/schoolFeeStructure.services.js";
import { getSessionService } from "../../services/session.services.js";
import { error, success } from "../../utills/responseWrapper.js";
import { getClassService } from "../../services/class.sevices.js";
import { createSectionFeeStructureService, getSectionFeeStructureService, getSectionFeeStructuresPipelineService } from "../../services/feeStructure/sectionFeeStructure.services.js";
import { createFeeInstallmentService } from "../../services/feeStructure/feeInstallment.service.js";
import { getSectionService } from "../../services/section.services.js";
import { convertToMongoId } from "../../services/mongoose.services.js";

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
      const section = await getSectionService({_id: sectionFeeObj.sectionId, admin: adminId, classId: classId});
      if(!section) {
        continue;
      }
      const feeStructurePayload = {
        title: title ? title : `FEE STRUCTURE:- Section: ${section.name}, Class: ${classInfo.name}, Session: ${session.academicStartYear}-${session.academicEndYear}`,
        description,
        classId,
        session: sessionId,
        totalAmount,
        section: sectionFeeObj.sectionId,
        school: adminId,
        schoolFeeStructure: schoolFeeStructureId
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

export async function getSectionFeeStructureController(req, res) {
  try {
    const { sessionId, classId, sectionId } = req.query;
    const adminId = req.adminId;

    const filter = {
      school: convertToMongoId(adminId)
    }

    if(classId) {
      filter.classId = convertToMongoId(classId);
    }

    if(sectionId) {
      filter.section = convertToMongoId(sectionId);
    }
    if(sessionId) {
      filter.session = convertToMongoId(sessionId);
    }

    const pipeline = [
      {
        $match: filter
      },
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'class'
        }
      },
      {
        $unwind: {
          path: '$class',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'sections',
          localField: 'section',
          foreignField: '_id',
          as: 'section'
        }
      },
      {
        $unwind: {
          path: '$section',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'schoolfeestructures',
          localField: 'schoolFeeStructure',
          foreignField: '_id',
          as: 'schoolFeeStructure'
        }
      },
      {
        $unwind: {
          path: '$schoolFeeStructure',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'feeinstallments',
          localField: '_id',
          foreignField: 'sectionFeeStructure',
          as: 'feeInstallments'
        }
      }
    ]

    const sectionFeeStructure = await getSectionFeeStructuresPipelineService(pipeline);
    return res.status(StatusCodes.OK).send(success(200, sectionFeeStructure));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}