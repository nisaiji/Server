
import cordinatorModel from "../models/cordinator.model.js";
import sectionModel from "../models/section.model.js";

export async function checkCordinatorExist(username, email) {
  try {
    const existCordinator = await cordinatorModel.findOne({
      $or: [{ username }, { email }]
    });
    return existCordinator;
  } catch (err) {
    return err;
  }
}

export async function createCordinator(
  username,
  firstname,
  lastname,
  email,
  password,
  phone
) {
  try {
    const cordinator = await cordinatorModel.create({
      username,
      firstname,
      lastname,
      email,
      password,
      phone
    });
    return cordinator;
  } catch (err) {
    return err;
  }
}

export async function findCordinatorByUsername(username) {
  try {
    const cordinator = await cordinatorModel.findOne({ username });
    return cordinator;
  }catch (err) {
    return err;
  }
}


export async function findCordinatorById(id){
  try {
    const cordinator = await cordinatorModel.findById(id);
    console.log({id,cordinator})
    return cordinator;
  } catch (error) {
    return error;
  }
}

export async function deleteCordinator(id){
  try {
    const cordinator = await cordinatorModel.findByIdAndDelete(id);
    await sectionModel.updateMany(
      {cordinator:id},
      {$unset:{cordinator:1}}
    );
    return cordinator;
  } catch (error) {
    return error;    
  }
}