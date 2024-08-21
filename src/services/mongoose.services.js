import mongoose from 'mongoose'

export function isValidMongoId(id){
  return mongoose.Types.ObjectId.isValid(id);
}