import feeDashboardSnapshotModel from "../models/feeStructure/feeDashboardSnapshot.model.js";

export async function getFeeDashboardSnapshotsPipelineService(pipeline) {
  try {
    const feeDashboardSnapshots = await feeDashboardSnapshotModel
      .aggregate(pipeline)
      .exec();
    return feeDashboardSnapshots;
  } catch (error) {
    throw error;
  }
}

export async function getFeeDashboardSnapshotService(
  filter,
  projection = {},
  sortingLogic
) {
  try {
    const feeDashboardSnapshot = await feeDashboardSnapshotModel
      .findOne(filter)
      .select(projection)
      .sort(sortingLogic)
      .lean();
    return feeDashboardSnapshot;
  } catch (error) {
    throw error;
  }
}

export async function getFeeDashboardSnapshotsService(
  filter,
  projection = {},
  sortingLogic
) {
  try {
    const feeDashboardSnapshots = await feeDashboardSnapshotModel
      .find(filter)
      .select(projection)
      .sort(sortingLogic)
      .lean();
    return feeDashboardSnapshots;
  } catch (error) {
    throw error;
  }
}

export async function registerFeeDashboardSnapshotService(paramObj) {
  try {
    const event = await feeDashboardSnapshotModel.create(paramObj);
    return event;
  } catch (error) {
    throw error;
  }
}

export async function updateFeeDashboardSnapshotService(
  filter,
  update,
  options = {}
) {
  try {
    const event = await feeDashboardSnapshotModel.updateOne(
      filter,
      update,
      options
    );
    return event;
  } catch (error) {
    throw error;
  }
}

export async function getFeeDashboardSnapshotsCountService(filter) {
  try {
    const events = await feeDashboardSnapshotModel.countDocuments(filter);
    return events;
  } catch (error) {
    throw error;
  }
}

export async function removeFeeDashboardSnapshotsService(filter) {
  try {
    const events = await feeDashboardSnapshotModel.deleteOne(filter);
    return events;
  } catch (error) {
    throw error;
  }
}

export async function getStudentFeeInstallmentDistinctService(field, filter) {
  try {
    const events = await feeDashboardSnapshotModel.distinct(field, filter);
    return events;
  } catch (error) {
    throw error;
  }
}
