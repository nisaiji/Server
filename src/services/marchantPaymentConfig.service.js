import marchantPaymentConfigModel from "../models/payments/marchantPaymentConfig.model.js";

export async function getMarchantPaymentConfigService(filter){
  try {
    const marchantPaymentConfig = await marchantPaymentConfigModel.findOne(filter).lean();
    return marchantPaymentConfig;
  } catch (error) {
    throw error;    
  }
}

export async function getMarchantPaymentConfigsService(filter, sortingLogic, skipNumber, limitNumber){
try {
  const marchantPaymentConfigs = await marchantPaymentConfigModel.find(filter).select({password:0}).sort(sortingLogic).skip(skipNumber).limit(limitNumber);
  return marchantPaymentConfigs;
} catch (error) {
  throw error;  
}
}

export async function getMarchantPaymentConfigCountService(filter){
try {
  const count = await marchantPaymentConfigModel.countDocuments(filter);
  return count;
} catch (error) {
  throw error;  
}
}

export async function createMarchantPaymentConfigService(data) {
  try {
    console.log("data in service:", data);
    const marchantPaymentConfig = await marchantPaymentConfigModel.create(data);
    return marchantPaymentConfig;
  } catch (error) {
    throw error;
  }
}

export async function updateMarchantPaymentConfigService(filter, update){
  try {
    const marchantPaymentConfig = await marchantPaymentConfigModel.updateOne(filter, update);
    return marchantPaymentConfig;
  } catch (error) {
    throw error;    
  }
}
