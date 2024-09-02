import holidayEventModel from "../models/holidayEvent.model.js";
import parentModel from "../models/parent.model.js";
import studentModel from "../models/student.model.js";


export async function getParentService(filter, projection={} ){
  try {
    const parent = await parentModel.find(paramObj).select(projection);
    return parent;
  } catch (error) {
    throw error;
  }
}

export async function registerParentService( data ){
  try {
    const parent = await parentModel.create(data);
    return parent;
  } catch (error) {
    throw error;
  }
}

export async function updateParentService(filter, update){
  try {
    const student = await parentModel.findOneAndUpdate(filter, update);
    return student;
  } catch (error) {
    throw error;    
  }
}

 

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
    const parent = await parentModel.create({fullname, phone,password,admin});
    return parent;
  } catch (error) {
    throw error;
  }
}
export async function updateParent({fullname,phone}){
  try {
    const parent = await parentModel.create({fullname, phone,password});
    return parent;
  } catch (error) {
    throw error;
  }
}
export async function updateParentInfo(data){
  try {
    const {id,fullname,gender,age,email,phone,qualification,occupation,address} = data;
    const parent = await parentModel.findByIdAndUpdate(id,{fullname,gender,age,email,phone,qualification,occupation,address});
    return parent;
  } catch (error) {
    throw error;
  }
}


export async function diActivateParentByIdService(data){
  try {
    const {id} = data;
    const parent = await parentModel.findByIdAndUpdate(id,{isActive:false});
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

export async function findParentById(data) {
  try {
    const {id} = data;
    const parent = await parentModel.findById({ _id:id, isActive:true });
    return parent;
  } catch (error) {
    throw error;
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
export async function updateProfileParent(data){
  try {
    const{id,phone,email} = data;
    const parent = await parentModel.findByIdAndUpdate(id , {phone,email});
    return parent;
  } catch (error) {
    throw error;
  }
}

export async function updateProfileInfoParent({id,fullname,age,gender,address,qualification,occupation}){
  try {
    const parent = await parentModel.findByIdAndUpdate(id , {fullname,age,gender,address,qualification,occupation});
    return parent;
  } catch (error) {
    throw error;
  }
}

export async function findParent(data){
  try {
    const {user} = data;
    const parent = await parentModel.findOne({$or:[{username:user},{email:user},{phone:user}],isActive:true})    
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

export async function getChildrenOfParent(data){
  try {
    const{id} = data;
    const children = await studentModel.find({parent:parentId}).populate({path:"section",select:"name"}).populate({path:"classId",select:"name"});
    return children;
  } catch (error) {
    throw error;
    
  }
}

export async function getAllEventHolidays({adminId,startOfMonth,endOfMonth }){
  try {
    const holidayEventList = await holidayEventModel.find({ admin: adminId,date: {$gte:startOfMonth,$lte:endOfMonth} });
    return holidayEventList;
  } catch (error) {
    throw error;    
  }
}

export async function getParentById(data){
  try {
    const {id} = data;
    const parent = await parentModel.findOne({id,isActive:true}).select({"password":0});
    return parent;
  } catch (error) {
    throw error;
  }
}