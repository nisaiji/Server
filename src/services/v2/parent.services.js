import parentModel from "../../models/v2/parent.model.js";

export async function getParentService(filter, projection={}) {
  try {
    const parent = await parentModel.findOne(filter).select(projection);
    return parent;
  } catch (error) {
    throw error;
  }
}

export async function getParentsService(paramObj){
  try {
    const parents = await parentModel.find(paramObj);
    return parents;
  } catch (error) {
    throw error;
  }
}

export async function registerParentService(data) {
  try {
    const parent = await parentModel.create(data);
    return parent;
  } catch (error) {
    throw error;
  }
}

export async function updateParentService(filter, update){
  try {
      const parent = await parentModel.updateOne(filter, update);
      return parent;
  } catch (error) {
    throw error;
  }
}

export async function getParentCountService(filter){
  try {
    const parents = await parentModel.countDocuments(filter);
    return parents;
  } catch (error) {
    throw error;  
  }
}

export async function getParentsPipelineService(pipeline){
  try {
    const parents = await parentModel.aggregate(pipeline).exec();
    return parents;
  } catch (error) {
    throw error;    
  }
}
