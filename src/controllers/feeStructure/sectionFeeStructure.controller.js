import { StatusCodes } from "http-status-codes";
import { getSchoolFeeStructureService, getSchoolFeeStructuresPipelineService } from "../../services/feeStructure/schoolFeeStructure.services.js";
import { getSessionService, getSessionsPipelineService } from "../../services/session.services.js";
import { error, success } from "../../utills/responseWrapper.js";
import { getClassService } from "../../services/class.sevices.js";
import { createSectionFeeStructureService, getSectionFeeStructureService, getSectionFeeStructuresPipelineService } from "../../services/feeStructure/sectionFeeStructure.services.js";
import { createFeeInstallmentService, getFeeInstallmentService, updateFeeInstallmentService } from "../../services/feeStructure/feeInstallment.service.js";
import { getSectionService } from "../../services/section.services.js";
import { convertToMongoId } from "../../services/mongoose.services.js";
import { getSessionStudentService } from "../../services/v2/sessionStudent.service.js";

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
    // let sectionFeeStructure = await getSectionFeeStructureService({ classId, session: sessionId, school: adminId });
    // if (sectionFeeStructure) {
    //   return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Fee Structure already exists!"));
    // }
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

export async function updateSectionFeeStructureController(req, res) {
  try {
    const { sectionsFee, schoolFeeStructureId } = req.body;
    const adminId = req.adminId;

    const schoolFeeStructure = await getSchoolFeeStructureService({ _id: schoolFeeStructureId, school: adminId });
    
    if(!schoolFeeStructure) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Fee structure not found!"));
    }

    const session = await getSessionService({ _id: sessionId });
    if (!session || session['status'] === 'completed') {
      return res.status(StatusCodes.BAD_REQUEST).send(error(404, "Session completed!"));
    }

    for (const sectionFeeObj of sectionsFee) {
      const sectionFeeStructure = await getSectionFeeStructureService({_id: sectionFeeObj.sectionFeeStructureId, school: adminId, schoolFeeStructure: schoolFeeStructureId});
      if(!sectionFeeStructure) {
        continue;
      }
      const sectionFeeStructurePayload = { };
      if(sectionFeeObj.totalAmount) sectionFeeStructurePayload.totalAmount = sectionFeeObj.totalAmount;

      const updatedSectionFeeStructure = await createSectionFeeStructureService({ _id: sectionFeeObj.sectionFeeStructureId }, sectionFeeStructurePayload);

      for (const installment of sectionFeeObj.feeInstallments) {
        const installment = await getFeeInstallmentService({_id: installment.feeInstallmentId, sectionFeeStructure: sectionFeeObj.sectionFeeStructureId});
        if(!installment || installment.dueDate <= new Date().getTime()) {
          continue;
        } 
        const feeInstallmentPayload = { };
        if(installment.amount) feeInstallmentPayload.amount = installment.amount;
        await updateFeeInstallmentService({_id: installment.feeInstallmentId}, feeInstallmentPayload);
      }
    }

    return res.status(StatusCodes.CREATED).send(success(201, { message: "Fee structure updated successfully"}));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getSessionStudentFeeStructureController(req, res) {
  try {
    const { sessionStudentId } = req.params;
    const parentId = req.parentId;

    const sessionStudent = await getSessionStudentService({_id: sessionStudentId});
    if (!sessionStudent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session Student not found"));
    }
    const sectionFeeStructure = await getSectionFeeStructuresPipelineService([
      {
        $match: {
          classId: convertToMongoId(sessionStudent.classId),
          section: convertToMongoId(sessionStudent.section),
          session: convertToMongoId(sessionStudent.session)
        }
      },
      {
        $lookup: {
          from: 'feeinstallments',
          localField: '_id',
          foreignField: 'sectionFeeStructure',
          as: 'feeInstallments'
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
      }
    ]);
    
    return res.status(StatusCodes.OK).send(success(200, sectionFeeStructure));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getSessionFeeStructureController(req, res) {
  try {
    const { sessionId } = req.params;
    const adminId = req.adminId;

    const sessionFeeStructures = await getSessionsPipelineService([
      {
        $match: {
          _id: convertToMongoId(sessionId),
          school: convertToMongoId(adminId)
        }
      },
      {
        $lookup: {
          from: 'classes',
          localField: '_id',
          foreignField: 'session',
          pipeline: [
            {
              $lookup: {
                from: 'sections',
                localField: '_id',
                foreignField: 'classId',
                pipeline: [
                  {
                    $lookup: {
                      from: 'sectionfeestructures',
                      localField: '_id',
                      foreignField: 'section',
                      pipeline: [
                        {
                          $lookup: {
                            from: 'feeinstallments',
                            localField: '_id',
                            foreignField: 'sectionFeeStructure',
                            as: 'feeInstallments'
                          }
                        }
                      ],
                      as: 'sectionFeeStructure'
                    }
                  },
                  {
                    $unwind: {
                      path: '$sectionFeeStructure',
                      preserveNullAndEmptyArrays: true
                    }
                  }
                ],
                as: 'sections'
              }
            }
          ],
          as: 'classes'
        }
      }
    ]);

    const schoolFeeStructure = await getSchoolFeeStructureService({ school: adminId, session: sessionId });

    return res.status(StatusCodes.OK).send(success(200, {schoolFeeStructure, sessionSectionsFeeStructure:sessionFeeStructures[0]}));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}
