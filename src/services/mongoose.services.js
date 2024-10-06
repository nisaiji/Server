import mongoose from 'mongoose'

export function isValidMongoId(id){
  return mongoose.Types.ObjectId.isValid(id);
}

export function convertToMongoId(id){
  return new mongoose.Types.ObjectId(id);
}