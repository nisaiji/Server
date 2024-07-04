import holidayEventModel from "../models/holidayEvent.model.js";
import parentModel from "../models/parent.model.js";
import studentModel from "../models/student.model.js";


export async function checkParentExist({phone}){
  try {
    const parent = await parentModel.findOne({phone});
    return parent;
  } catch (error) {
    throw error;    
  }
}

export async function registerParent({fullname,phone,password,admin}){
  try {
    console.log({password});
    const parent = await parentModel.create({fullname, phone,password,admin});
    return parent;
  } catch (error) {
    throw error;
  }
}
export async function updateParent({fullname,phone}){
  try {
    console.log({password});
    const parent = await parentModel.create({fullname, phone,password});
    return parent;
  } catch (error) {
    throw error;
  }
}


export async function deleteParentById(parentId){
  try {
    const parent = await parentModel.findByIdAndDelete(parentId);
    return parent;
  } catch (error) {
    throw error;    
  }
}


export async function checkParentExist1(username, email) {
  try {
    const existingParent = await parentModel.findOne({
      $or: [{ username }, { email }],
    });
    return existingParent;
  } catch (error) {
    return error;
  }
}

export async function createParent(data) {
  try {
    const parent = await parentModel.create({
      username: data.username,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      phone: data.phone,
      address: data.address,
      password: data.password,
    });
    return parent;
  } catch (error) {
    return error;
  }
}
// export async function createParent(
//   username,
//   firstname,
//   lastname,
//   phone,
//   email,
//   password,
//   address
// ) {
//   try {
//     const parent = await parentModel.create({
//       username,
//       firstname,
//       lastname,
//       phone,
//       email,
//       password,
//       address
//     });
//     return parent;
//   } catch (error) {
//     return error;
//   }
// }

export async function findParentByUsername(username) {
  try {
    const parent = await parentModel.findOne({ username });
    return parent;
  } catch (error) {
    return error;
  }
}

export async function findParentByPhoneNo(phoneNo) {
  try {
    const parent = await parentModel.findOne({ phone: phoneNo });
    return parent;
  } catch (error) {
    return error;
  }
}

export async function findParentById(_id) {
  try {
    const parent = await parentModel.findById({ _id });
    return parent;
  } catch (error) {
    return error;
  }
}


export async function updateInfoParent({parentId,fullname,phone}){
  try {
    const parent = await parentModel.findByIdAndUpdate(parentId,{fullname,phone});
    return parent;
  } catch (error) {
    throw error;    
  }
}

export async function updateAuthParent({id,username,password}){
  try {
    const parent = await parentModel.findByIdAndUpdate(id , {username,password});
    return parent;
  } catch (error) {
    throw error;
  }
}
export async function updateProfileParent({id,phone,email}){
  try {
    const parent = await parentModel.findByIdAndUpdate(id , {phone,email});
    return parent;
  } catch (error) {
    throw error;
  }
}

export async function findParent(user){
  try {
    const parent = await parentModel.findOne({$or:[{username:user},{email:user},{phone:user}]})    
    return parent;
  } catch (error) {
    throw error;
  }
}

export function checkChildExist(children, childId) {
  return children.includes(childId);
}

export async function checkStudentAlreadyLinkedToParent(studentId) {
  try {
    const parent = parentModel.findOne({ child: { $in: studentId } });
    return parent;
  } catch (error) {
    return error;
  }
}



export async function getChildrenOfParent(parentId){
  try {
    const children = await studentModel.find({parent:parentId}).populate({path:"section",select:"name"}).populate({path:"classId",select:"name"});
    return children;
  } catch (error) {
    throw error;
    
  }
}

export async function getAllEventHolidays(adminId){
  try {
    const holidayEvents = await holidayEventModel.find({admin:adminId});
    return holidayEvents;
  } catch (error) {
    throw error;    
  }
}