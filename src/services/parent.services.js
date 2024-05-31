import parentModel from "../models/parent.model.js";

export async function checkParentExist(username, email) {
  try {
    const existingParent = await parentModel.findOne({
      $or: [{ username }, { email }]
    });
    return existingParent;
  } catch (error) {
    return error;
  }
}

export async function createParent(data) {
  try {
    const parent = await parentModel.create({
      username:data.username,
      firstname:data.firstname,
      lastname:data.lastname,
      email:data.email,
      phone:data.phone,
      address:data.address,
      password:data.password,
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
    const parent = await parentModel.findOne({ phone:phoneNo });
    return parent;
  } catch (error) {
    return error;
  }
}

export async function findParentById(_id){
  try {
    const parent = await parentModel.findById({_id});
    return parent;
  } catch (error) {
    return error;    
  }
}

export function checkChildExist(children , childId){
  return children.includes(childId); 
}

export async function checkStudentAlreadyLinkedToParent(studentId){
  try{
    const parent = parentModel.findOne({ child: { $in: studentId } });
    return parent;
  } catch (error) {
    return error;    
  }
}