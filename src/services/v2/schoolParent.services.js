import schoolParentModel from "../../models/v2/schoolParent.model.js";
import { convertToMongoId } from "../mongoose.services.js";

export async function getSchoolParentService(filter, projection={}) {
  try {
    const schoolParent = await schoolParentModel.findOne(filter).select(projection);
    return schoolParent;
  } catch (error) {
    throw error;
  }
}

export async function getSchoolParentsService(paramObj){
  try {
    const schoolParents = await schoolParentModel.find(paramObj);
    return schoolParents;
  } catch (error) {
    throw error;
  }
}

export async function registerSchoolParentService(data) {
  try {
    const schoolParent = await schoolParentModel.create(data);
    return schoolParent;
  } catch (error) {
    throw error;
  }
}

export async function updateSchoolParentService(filter, update){
  try {
      const schoolParent = await schoolParentModel.updateOne(filter, update);
      return schoolParent;
  } catch (error) {
    throw error;
  }
}

export async function updateSchoolParentsService(filter, update){
  try {
      const schoolParent = await schoolParentModel.updateMany(filter, update);
      return schoolParent;
  } catch (error) {
    throw error;
  }
}

export async function getSchoolParentCountService(filter){
  try {
    const schoolParents = await schoolParentModel.countDocuments(filter);
    return schoolParents;
  } catch (error) {
    throw error;  
  }
}

export async function getParentsByAdminIdService(adminId){
  try {
    const parents = await schoolParentModel.aggregate([
      {
        $match: {
          school: convertToMongoId(adminId),
          isActive: true
        }
      },
      {
        $lookup: {
          from: 'parents',
          localField: 'parent',
          foreignField: '_id',
          as: 'parent'
        }
      },
      {
        $unwind: '$parent'
      },
      {
        $replaceWith: '$parent'
      }
    ])
    return parents;
  } catch (error) {
    throw error;    
  }
}