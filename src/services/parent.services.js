import parentModel from "../models/parent.model.js";


export async function checkParentExist({phone}){
  try {
    const parent = await parentModel.findOne({phone});
    return parent;
  } catch (error) {
    throw error;    
  }
}

export async function registerParent({firstname,phone,password}){
  try {
    console.log({password});
    const parent = await parentModel.create({firstname, phone,password});
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


export async function updateAuthParent({id,username,email,password}){
  try {
    const parent = await parentModel.findByIdAndUpdate(id , {username,email,password});
    return parent;
  } catch (error) {
    throw error;
  }
}
export async function updateProfileParent({id,firstname,lastname,phone}){
  try {
    const parent = await parentModel.findByIdAndUpdate(id , {firstname,lastname,phone});
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
