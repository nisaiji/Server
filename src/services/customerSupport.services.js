import customerSupportQueryModel from "../models/customerSupportQuery.model.js";


export async function getCustomerSupportQueryService(filter){
  try {
    const query = await customerSupportQueryModel.findOne(filter).lean();
    return query;
  } catch (error) {
    throw error;    
  }
}

export async function getCustomerSupportQueriesService(filter){
try {
  const queries = await customerSupportQueryModel.find(filter);
  return queries;
} catch (error) {
  throw error;  
}
}

export async function getCustomerSupportQueryCountService(filter){
try {
  const count = await customerSupportQueryModel.countDocuments(filter);
  return count;
} catch (error) {
  throw error;  
}
}

export async function registerCustomerSupportQueryService(data) {
  try {
    const query = await customerSupportQueryModel.create(data);
    return query;
  } catch (error) {
    throw error;
  }
}

export async function updateCustomerSupportQueryService(filter, update){
  try {
    const query = await customerSupportQueryModel.updateOne(filter, update);
    return query;
  } catch (error) {
    throw error;    
  }
}

