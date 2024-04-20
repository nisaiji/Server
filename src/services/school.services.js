import schoolModel from "../models/school.model.js";

export async function checkSchoolExist(adminName, email) {
  try {
    const existingSchool = await schoolModel.findOne({
      $or: [{ adminName }, { email }]
    });
    return existingSchool;
  } catch (err) {
    return err;
  }
}

export async function createSchool(
  name,
  affiliationNo,
  address,
  email,
  phone,
  adminName,
  password
) {
  try {
    const school = await schoolModel.create({
      name,
      affiliationNo,
      address,
      email,
      phone,
      adminName,
      password
    });
    return school;
  } catch (err) {
    return err;
  }
}


export async function findSchoolByAdminName(adminName){
    try {
        const school = await schoolModel.findOne({adminName});
        return school;
    } catch (err) {
        return err;
    }
}

export async function findSchoolByID(_id){
  try {
    const school = await schoolModel.findById({_id});  
    return school; 
  } catch (err){
    return err;    
  }
}