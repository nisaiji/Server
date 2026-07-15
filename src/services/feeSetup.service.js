import feeCycleModel from "../models/fee/feeCycle.model.js";
import feeHeadModel from "../models/fee/feeHead.model.js";
import feeStructureModel from "../models/fee/feeStructure.model.js";

export async function createFeeCycleService(data) {
  return await feeCycleModel.create(data);
}

export async function getFeeCycleService(paramObj) {
  return await feeCycleModel.findOne(paramObj);
}

export async function updateFeeCycleService(filter, update) {
  return await feeCycleModel.findOneAndUpdate(filter, update, {
    returnDocument: "after"
  });
}

export async function createFeeHeadService(data) {
  return await feeHeadModel.create(data);
}

export async function getFeeHeadService(paramObj) {
  return await feeHeadModel.findOne(paramObj);
}

export async function addFeeHeadService(filter, feeHead) {
  return await feeHeadModel.findOneAndUpdate(
    filter,
    { $push: { feeHeads: feeHead } },
    { returnDocument: "after" }
  );
}

export async function updateFeeHeadService(filter, feeHead) {
  return await feeHeadModel.findOneAndUpdate(
    filter,
    {
      $set: {
        "feeHeads.$.name": feeHead.name,
        "feeHeads.$.label": feeHead.label,
        "feeHeads.$.type": feeHead.type,
        "feeHeads.$.refundable": feeHead.refundable
      }
    },
    { returnDocument: "after" }
  );
}

export async function updateFeeHeadVerifyStatusService(filter, feeHead) {
  return await feeHeadModel.findOneAndUpdate(filter, feeHead, {
    returnDocument: "after"
  });
}

export async function deleteFeeHeadService(filter, feeHeadId) {
  return await feeHeadModel.findOneAndUpdate(
    filter,
    { $pull: { feeHeads: { _id: feeHeadId } } },
    { returnDocument: "after" }
  );
}

export async function createFeeStructureService(data) {
  return await feeStructureModel.create(data);
}

export async function getFeeStructureService(paramObj) {
  return await feeStructureModel.findOne(paramObj);
}

export async function getFeeStructuresService(paramObj) {
  return await feeStructureModel.find(paramObj).sort({ createdAt: -1 });
}

export async function getFeeStructureListingService({
  match,
  search,
  skip,
  limit
}) {
  const searchMatch = search
    ? {
        $or: [
          { "classInfo.name": { $regex: search, $options: "i" } },
          { "feeCycleInfo.frequency": { $regex: search, $options: "i" } }
        ]
      }
    : {};

  const result = await feeStructureModel.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "classes",
        localField: "classId",
        foreignField: "_id",
        as: "classInfo"
      }
    },
    { $unwind: { path: "$classInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "sessions",
        localField: "sessionId",
        foreignField: "_id",
        as: "sessionInfo"
      }
    },
    { $unwind: { path: "$sessionInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "feecycles",
        localField: "feeCycleId",
        foreignField: "_id",
        as: "feeCycleInfo"
      }
    },
    { $unwind: { path: "$feeCycleInfo", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        academicYear: {
          $concat: [
            { $toString: "$sessionInfo.academicStartYear" },
            "-",
            { $toString: "$sessionInfo.academicEndYear" }
          ]
        }
      }
    },
    { $match: searchMatch },
    { $sort: { updatedAt: -1 } },
    {
      $facet: {
        records: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              classId: 1,
              sessionId: 1,
              feeCycleId: 1,
              className: "$classInfo.name",
              academicYear: 1,
              sessionName: "$sessionInfo.name",
              feeCycle: "$feeCycleInfo.frequency",
              status: 1,
              updatedAt: 1,
              createdAt: 1
            }
          }
        ],
        totalCount: [{ $count: "count" }]
      }
    }
  ]);

  const records = result[0]?.records || [];
  const total = result[0]?.totalCount[0]?.count || 0;

  return {
    records,
    total
  };
}

export async function updateFeeStructureService(filter, update) {
  return await feeStructureModel.findOneAndUpdate(filter, update, {
    returnDocument: "after"
  });
}

export async function deleteFeeStructureService(filter) {
  return await feeStructureModel.findOneAndDelete(filter);
}
