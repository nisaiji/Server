import sessionStudentWalletModel from "../models/feeStructure/sessionStudentWallet.model.js";

export async function getSessionStudentWalletsPipelineService(pipeline) {
  try {
    const wallets = await sessionStudentWalletModel.aggregate(pipeline).exec();
    return wallets;
  } catch (error) {
    throw error;
  }
}

export async function getSessionStudentWalletService(filter, projection = {}) {
  try {
    const wallet = await sessionStudentWalletModel.findOne(filter).select(projection);
    return wallet;
  } catch (error) {
    throw error;
  }
}

export async function getSessionStudentWalletsService(filter, projection = {}) {
  try {
    const wallets = await sessionStudentWalletModel.find(filter).select(projection);
    return wallets;
  } catch (error) {
    throw error;
  }
}

export async function deleteSessionStudentWalletService(filter) {
  try {
    const wallet = await sessionStudentWalletModel.findOneAndDelete(filter);
    return wallet;
  } catch (error) {
    throw error;
  }
}

export async function registerSessionStudentWalletService(paramObj) {
  try {
    const wallet = await sessionStudentWalletModel.create(paramObj);
    return wallet;
  } catch (error) {
    throw error;
  }
}

export async function updateSessionStudentWalletService(filter, update) {
  try {
    const wallet = await sessionStudentWalletModel.updateOne(filter, update);
    return wallet;
  } catch (error) {
    throw error;
  }
}

export async function getSessionStudentWalletsCountService(filter) {
  try {
    const count = await sessionStudentWalletModel.countDocuments(filter);
    return count;
  } catch (error) {
    throw error;
  }
}
