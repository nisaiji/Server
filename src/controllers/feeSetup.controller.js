import { StatusCodes } from "http-status-codes";
import { error, success } from "../utils/responseWrapper.js";
import { getSessionService } from "../services/session.services.js";
import { convertToMongoId, isValidMongoId } from "../services/mongoose.services.js";
import { getClassService } from "../services/class.sevices.js";
import { getSectionsService } from "../services/section.services.js";
import {
  addFeeHeadService,
  createFeeCycleService,
  createFeeHeadService,
  createFeeStructureService,
  deleteFeeHeadService,
  deleteFeeStructureService,
  getFeeCycleService,
  getFeeHeadService,
  getFeeStructureListingService,
  getFeeStructureService,
  getFeeStructuresService,
  updateFeeCycleService,
  updateFeeHeadService,
  updateFeeStructureService,
} from "../services/feeSetup.service.js";

function hasInvalidMongoIds(ids) {
  return ids.some((id) => !isValidMongoId(id));
}

function getFeeStructureIds(feeStructureData) {
  const sectionIds = feeStructureData.applicableSections.map(({ section }) => section.sectionId);
  const feeHeadIds = feeStructureData.applicableSections.flatMap(({ feeHeads }) => {
    return feeHeads.map(({ feeHeadId }) => feeHeadId);
  });

  return {
    sectionIds,
    feeHeadIds,
  };
}

async function validateFeeStructureData({ adminId, feeStructureData }) {
  const { sessionId, classId, feeCycleId, applicableSections } = feeStructureData;
  const { sectionIds, feeHeadIds } = getFeeStructureIds(feeStructureData);

  if (hasInvalidMongoIds([sessionId, classId, feeCycleId, ...sectionIds, ...feeHeadIds])) {
    return { statusCode: StatusCodes.BAD_REQUEST, message: "Invalid id in fee structure payload" };
  }

  const session = await getSessionService({
    _id: sessionId,
    school: adminId,
  });

  if (!session) {
    return { statusCode: StatusCodes.NOT_FOUND, message: "Session not found" };
  }

  if (session.status === "completed") {
    return { statusCode: StatusCodes.BAD_REQUEST, message: "Session completed! can't save fee structure" };
  }

  const feeCycle = await getFeeCycleService({
    _id: feeCycleId,
    adminId,
    sessionId,
  });

  if (!feeCycle) {
    return { statusCode: StatusCodes.NOT_FOUND, message: "Fee cycle not found" };
  }

  const classInfo = await getClassService({
    _id: classId,
    admin: adminId,
    session: sessionId,
  });

  if (!classInfo) {
    return { statusCode: StatusCodes.NOT_FOUND, message: "Class not found" };
  }

  const sections = await getSectionsService({
    _id: { $in: sectionIds },
    admin: adminId,
    session: sessionId,
    classId,
  });

  if (sections.length !== new Set(sectionIds).size) {
    return { statusCode: StatusCodes.NOT_FOUND, message: "One or more sections not found" };
  }

  const feeHeadGroup = await getFeeHeadService({
    adminId,
    sessionId,
  });

  if (!feeHeadGroup) {
    return { statusCode: StatusCodes.NOT_FOUND, message: "Fee heads not found" };
  }

  const existingFeeHeadIds = new Set(feeHeadGroup.feeHeads.map((feeHead) => feeHead._id.toString()));
  const hasInvalidFeeHead = feeHeadIds.some((feeHeadId) => !existingFeeHeadIds.has(feeHeadId));

  if (hasInvalidFeeHead) {
    return { statusCode: StatusCodes.NOT_FOUND, message: "One or more fee heads not found" };
  }

  return {
    data: {
      ...feeStructureData,
      adminId,
      applicableSections,
    },
  };
}

function buildFeeStructureDetails({ feeStructure, classInfo, feeHeadGroup }) {
  const feeStructureObj = feeStructure.toObject();
  const feeHeadMap = new Map(
    (feeHeadGroup?.feeHeads || []).map((feeHead) => {
      const feeHeadObj = feeHead.toObject ? feeHead.toObject() : feeHead;
      return [feeHeadObj._id.toString(), feeHeadObj];
    }),
  );

  const applicableSections = feeStructureObj.applicableSections.map((applicableSection) => {
    return {
      ...applicableSection,
      feeHeads: applicableSection.feeHeads.map((feeHead) => {
        return {
          ...feeHead,
          feeHeadDetails: feeHeadMap.get(feeHead.feeHeadId.toString()) || null,
        };
      }),
    };
  });

  const feeBreakdownMap = new Map();
   const grandTotalBySection = applicableSections.map((applicableSection) => {
    //let total = 0;

    applicableSection.feeHeads.forEach((feeHead) => {
      const feeHeadId = feeHead.feeHeadId.toString();
      const feeHeadDetails = feeHead.feeHeadDetails;

      if (!feeBreakdownMap.has(feeHeadId)) {
        feeBreakdownMap.set(feeHeadId, {
          feeHeadId,
          feeHeadDetails,
          amountsBySection: [],
       //   total: 0,
        });
      }

      const amount = feeHead.amount || 0;
      //total += amount;

      const feeBreakdown = feeBreakdownMap.get(feeHeadId);
      feeBreakdown.amountsBySection.push({
        sectionId: applicableSection.section.sectionId,
        sectionName: applicableSection.section.name,
        amount,
      });
    //  feeBreakdown.total += amount;
    });

    return {
      sectionId: applicableSection.section.sectionId,
      sectionName: applicableSection.section.name,
     // total,
    };
  });

  return {
    ...feeStructureObj,
    classDetails: classInfo
      ? {
          _id: classInfo._id,
          name: classInfo.name,
        }
      : null,
      applicableSections,
    // sessionDetails: session
    //   ? {
    //       _id: session._id,
    //       name: session.name,
    //       academicStartYear: session.academicStartYear,
    //       academicEndYear: session.academicEndYear,
    //       academicYear: `${session.academicStartYear}-${session.academicEndYear}`,
    //       status: session.status,
    //     }
    //   : null,
    // feeCycleDetails: feeCycle
    //   ? {
    //       _id: feeCycle._id,
    //       frequency: feeCycle.frequency,
    //       dueDate: feeCycle.dueDate,
    //     }
    //   : null,
    // sectionFeeType: feeStructureObj.amountForAllSections ? "SAME_FEE_AMOUNT" : "DIFFERENT_FEE_AMOUNT",
    // sections: applicableSections.map((applicableSection) => applicableSection.section),
   // feeBreakdown: Array.from(feeBreakdownMap.values()),
    //grandTotalBySection,
  };
}

export async function addFeeCycleController(req, res) {
  try {
    const { sessionId, frequency, dueDate } = req.body;
    const adminId = req.adminId;

    if (!isValidMongoId(sessionId)) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Invalid session Id"));
    }

    const session = await getSessionService({
      _id: sessionId,
      school: adminId,
    });

    if (!session) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session not found"));
    }

    if (session.status === "completed") {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Session completed! can't add fee cycle"));
    }

    const existingFeeCycle = await getFeeCycleService({
      adminId: adminId,
      sessionId: sessionId,
    });

    if (existingFeeCycle) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Fee cycle already exists for this session"));
    }

    const feeCycle = await createFeeCycleService({
      adminId,
      sessionId,
      frequency,
      dueDate,
    });

    return res.status(StatusCodes.CREATED).send(success(201, { feeCycle }));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Fee cycle already exists for this session"));
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getFeeCycleController(req, res) {
  try {
    const { sessionId } = req.params;
    const adminId = req.adminId;

    if (!isValidMongoId(sessionId)) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Invalid session Id"));
    }

    const feeCycle = await getFeeCycleService({
      adminId,
      sessionId,
    });

    if (!feeCycle) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Fee cycle not found"));
    }

    return res.status(StatusCodes.OK).send(success(200, { feeCycle }));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateFeeCycleController(req, res) {
  try {
    const { feeCycleId } = req.params;
    const { frequency, dueDate } = req.body;
    const adminId = req.adminId;

    if (!isValidMongoId(feeCycleId)) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Invalid fee cycle Id"));
    }

    const feeCycle = await getFeeCycleService({
      _id: feeCycleId,
      adminId,
    });

    if (!feeCycle) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Fee cycle not found"));
    }

    const session = await getSessionService({
      _id: feeCycle.sessionId,
      school: adminId,
    });

    if (!session) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session not found"));
    }

    if (session.status === "completed") {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Session completed! can't update fee cycle"));
    }

    const updatedFeeCycle = await updateFeeCycleService(
      {
        _id: feeCycleId,
        adminId,
      },
      {
        frequency,
        dueDate,
      },
    );

    return res.status(StatusCodes.OK).send(success(200, { feeCycle: updatedFeeCycle }));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function addFeeHeadController(req, res) {
  try {
    const { sessionId, name, label, type, refundable } = req.body;
    const adminId = req.adminId;

    if (!isValidMongoId(sessionId)) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Invalid session Id"));
    }

    const session = await getSessionService({
      _id: sessionId,
      school: adminId,
    });

    if (!session) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session not found"));
    }

    if (session.status === "completed") {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Session completed! can't add fee head"));
    }

    const feeHeadData = {
      name,
      label,
      type,
      refundable,
    };

    const existingFeeHeadGroup = await getFeeHeadService({
      adminId,
      sessionId,
    });

    if (!existingFeeHeadGroup) {
      const feeHead = await createFeeHeadService({
        adminId,
        sessionId,
        feeHeads: [feeHeadData],
      });

      return res.status(StatusCodes.CREATED).send(success(201, { feeHead }));
    }

    const duplicateFeeHead = existingFeeHeadGroup.feeHeads.some((feeHead) => {
      return feeHead.name === name || feeHead.label === label;
    });

    if (duplicateFeeHead) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Fee head already exists for this session"));
    }

    const feeHead = await addFeeHeadService(
      {
        adminId,
        sessionId,
      },
      feeHeadData,
    );

    return res.status(StatusCodes.CREATED).send(success(201, { feeHead }));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateFeeHeadController(req, res) {
  try {
    const { feeHeadId } = req.params;
    const { name, label, type, refundable } = req.body;
    const adminId = req.adminId;

    if (!isValidMongoId(feeHeadId)) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Invalid fee head Id"));
    }

    const feeHeadGroup = await getFeeHeadService({
      adminId,
      "feeHeads._id": feeHeadId,
    });

    if (!feeHeadGroup) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Fee head not found"));
    }

    const session = await getSessionService({
      _id: feeHeadGroup.sessionId,
      school: adminId,
    });

    if (!session) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session not found"));
    }

    if (session.status === "completed") {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Session completed! can't update fee head"));
    }

    const duplicateFeeHead = feeHeadGroup.feeHeads.some((feeHead) => {
      return feeHead._id.toString() !== feeHeadId && (feeHead.name === name || feeHead.label === label);
    });

    if (duplicateFeeHead) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Fee head already exists for this session"));
    }

    const feeHead = await updateFeeHeadService(
      {
        adminId,
        "feeHeads._id": feeHeadId,
      },
      {
        name,
        label,
        type,
        refundable,
      },
    );

    return res.status(StatusCodes.OK).send(success(200));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getFeeHeadController(req, res) {
  try {
    const { sessionId } = req.params;
    const adminId = req.adminId;

    if (!isValidMongoId(sessionId)) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Invalid session Id"));
    }

    const feeHead = await getFeeHeadService({
      adminId,
      sessionId,
    });

    if (!feeHead) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Fee heads not found"));
    }

    return res.status(StatusCodes.OK).send(success(200, { feeHead }));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function deleteFeeHeadController(req, res) {
  try {
    const { feeHeadId } = req.params;
    const adminId = req.adminId;

    if (!isValidMongoId(feeHeadId)) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Invalid fee head Id"));
    }

    const feeHeadGroup = await getFeeHeadService({
      adminId,
      "feeHeads._id": feeHeadId,
    });

    if (!feeHeadGroup) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Fee head not found"));
    }

    const session = await getSessionService({
      _id: feeHeadGroup.sessionId,
      school: adminId,
    });

    if (!session) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session not found"));
    }

    if (session.status === "completed") {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Session completed! can't delete fee head"));
    }

    const feeHead = await deleteFeeHeadService(
      {
        adminId,
        "feeHeads._id": feeHeadId,
      },
      feeHeadId,
    );

    return res.status(StatusCodes.OK).send(success(200));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function addFeeStructureController(req, res) {
  try {
    const adminId = req.adminId;
    const validation = await validateFeeStructureData({
      adminId,
      feeStructureData: req.body,
    });

    if (validation.message) {
      return res.status(validation.statusCode).send(error(validation.statusCode, validation.message));
    }

    const existingFeeStructure = await getFeeStructureService({
      adminId,
      sessionId: req.body.sessionId,
      classId: req.body.classId,
    });

    if (existingFeeStructure) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Fee structure already exists for this class"));
    }

    const feeStructure = await createFeeStructureService(validation.data);

    return res.status(StatusCodes.CREATED).send(success(201, { feeStructure }));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Fee structure already exists for this class"));
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getFeeStructureController(req, res) {
  try {
    const { feeStructureId } = req.params;
    const adminId = req.adminId;

    if (!isValidMongoId(feeStructureId)) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Invalid fee structure Id"));
    }

    const feeStructure = await getFeeStructureService({
      _id: feeStructureId,
      adminId,
    });

    if (!feeStructure) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Fee structure not found"));
    }

    const [classInfo, feeHeadGroup] = await Promise.all([
      getClassService({
        _id: feeStructure.classId,
        admin: adminId,
      }),
      // getSessionService({
      //   _id: feeStructure.sessionId,
      //   school: adminId,
      // }),
      // getFeeCycleService({
      //   _id: feeStructure.feeCycleId,
      //   adminId,
      // }),
      getFeeHeadService({
        adminId,
        sessionId: feeStructure.sessionId,
      }),
    ]);

    const feeStructureDetails = buildFeeStructureDetails({
      feeStructure,
      classInfo,
      feeHeadGroup,
    });

    return res.status(StatusCodes.OK).send(success(200, { feeStructure: feeStructureDetails }));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getFeeStructureListingController(req, res) {
  try {
    const adminId = req.adminId;
    const { search = "", classId, sessionId, status } = req.query;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    if (classId && !isValidMongoId(classId)) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Invalid class Id"));
    }

    if (sessionId && !isValidMongoId(sessionId)) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Invalid session Id"));
    }

    if (status && !["DRAFT", "ACTIVE"].includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Status must be DRAFT or ACTIVE"));
    }

    const match = {
      adminId: convertToMongoId(adminId),
    };

    if (classId) {
      match.classId = convertToMongoId(classId);
    }

    if (sessionId) {
      match.sessionId = convertToMongoId(sessionId);
    }

    if (status) {
      match.status = status;
    }

    const { records, total } = await getFeeStructureListingService({
      match,
      search,
      skip,
      limit,
    });

    return res.status(StatusCodes.OK).send(
      success(200, {
        feeStructures: records,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }),
    );
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateFeeStructureController(req, res) {
  try {
    const { feeStructureId } = req.params;
    const adminId = req.adminId;

    if (!isValidMongoId(feeStructureId)) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Invalid fee structure Id"));
    }

    const existingFeeStructure = await getFeeStructureService({
      _id: feeStructureId,
      adminId,
    });

    if (!existingFeeStructure) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Fee structure not found"));
    }

    const validation = await validateFeeStructureData({
      adminId,
      feeStructureData: req.body,
    });

    if (validation.message) {
      return res.status(validation.statusCode).send(error(validation.statusCode, validation.message));
    }

    const feeStructure = await updateFeeStructureService(
      {
        _id: feeStructureId,
        adminId,
      },
      validation.data,
    );

    return res.status(StatusCodes.OK).send(success(200));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Fee structure already exists for this class"));
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function deleteFeeStructureController(req, res) {
  try {
    const { feeStructureId } = req.params;
    const adminId = req.adminId;

    if (!isValidMongoId(feeStructureId)) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Invalid fee structure Id"));
    }

    const feeStructure = await getFeeStructureService({
      _id: feeStructureId,
      adminId,
    });

    if (!feeStructure) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Fee structure not found"));
    }

    const session = await getSessionService({
      _id: feeStructure.sessionId,
      school: adminId,
    });

    if (!session) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session not found"));
    }

    if (session.status === "completed") {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Session completed! can't delete fee structure"));
    }

    const deletedFeeStructure = await deleteFeeStructureService({
      _id: feeStructureId,
      adminId,
    });

    return res.status(StatusCodes.OK).send(success(200));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}
