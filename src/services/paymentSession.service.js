import paymentSessionModel from "../models/payments/paymentSession.model.js";

export async function getPaymentSessionervice(filter){
  try {
    const paymentSession = await paymentSessionModel.findOne(filter).lean();
    return paymentSession;
  } catch (error) {
    throw error;    
  }
}

export async function getPaymentSessionsService(filter, sortingLogic, skipNumber, limitNumber){
try {
  const paymentSessions = await paymentSessionModel.find(filter).select({password:0}).sort(sortingLogic).skip(skipNumber).limit(limitNumber);
  return paymentSessions;
} catch (error) {
  throw error;  
}
}

export async function getPaymentSessionCountService(filter){
try {
  const count = await paymentSessionModel.countDocuments(filter);
  return count;
} catch (error) {
  throw error;  
}
}

export async function createPaymentSessionService(data) {
  try {
    const paymentSession = await paymentSessionModel.create(data);
    return paymentSession;
  } catch (error) {
    throw error;
  }
}

export async function updatePaymentSessionService(filter, update){
  try {
    const paymentSession = await paymentSessionModel.updateOne(filter, update);
    return paymentSession;
  } catch (error) {
    throw error;    
  }
}
