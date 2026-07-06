import parentModel from "../../models/v2/parent.model.js";

export async function getParentService(filter, projection = {}) {
  const parent = await parentModel.findOne(filter).select(projection);
  return parent;
}

export async function getParentsService(paramObj) {
  const parents = await parentModel.find(paramObj);
  return parents;
}

export async function registerParentService(data) {
  const parent = await parentModel.create(data);
  return parent;
}

export async function updateParentService(
  filter,
  update,
  dbTransactionInstance
) {
  if (dbTransactionInstance) {
    const parent = await parentModel
      .updateOne(filter, update)
      .session(dbTransactionInstance);
    return parent;
  }
  const parent = await parentModel.updateOne(filter, update);
  return parent;
}

export async function getParentCountService(filter) {
  const parents = await parentModel.countDocuments(filter);
  return parents;
}

export async function getParentsPipelineService(pipeline) {
  const parents = await parentModel.aggregate(pipeline).exec();
  return parents;
}
