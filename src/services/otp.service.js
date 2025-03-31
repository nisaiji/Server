import otpModel from "../models/otp.model.js";

export async function getOtpService(filter, projection={}) {
  try {
    const otp = await otpModel.findOne(filter).select(projection);
    return otp;
  } catch (error) {
    throw error;
  }
}

export async function getOtpsService(paramObj){
  try {
    const otps = await otpModel.find(paramObj);
    return otps;
  } catch (error) {
    throw error;
  }
}

export async function registerOtpService(data) {
  try {
    const otp = await otpModel.create(data);
    return otp;
  } catch (error) {
    throw error;
  }
}

export async function updateOtpService(filter, update){
  try {
      const otp = await otpModel.updateOne(filter, update);
      return otp;
  } catch (error) {
    throw error;
  }
}

export async function getOtpCountService(filter){
  try {
    const count = await otpModel.countDocuments(filter);
    return count;
  } catch (error) {
    throw error;  
  }
}

export async function deleteOtpService(filter) {
  try {
    const otp = await otpModel.findOneAndDelete(filter);
    return otp;
  } catch (error) {
    throw error;
  }
}
