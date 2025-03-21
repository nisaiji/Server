import { getAccessTokenService } from "../services/JWTToken.service.js";
import {getParentService, updateParentService } from "../services/parent.services.js";
import {matchPasswordService, hashPasswordService } from "../services/password.service.js";
import { error, success } from "../utills/responseWrapper.js";
import { StatusCodes } from "http-status-codes";
import { getStudentsService } from "../services/student.service.js";


export async function loginParentController(req, res) {
  try {
    const { user, password } = req.body;
    const parent = await getParentService({$or: [{username: user}, {email: user}, {phone:user}], isActive:true});
    if (!parent) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(404, "Unauthorized user"));
    }
    const enteredPassword = password;
    const storedPassword = parent.password;
    const matchPassword = await matchPasswordService({enteredPassword, storedPassword});
    if (!matchPassword) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(404, "Unauthorized user"));
    }
    const email = parent["email"] || "not available";
    const accessToken = getAccessTokenService({
      role: "parent",
      parentId: parent["_id"],
      phone: parent["phone"],
      email,
      address: parent["address"]? parent["address"]:"",
      username: parent["username"]? parent["username"]: ""
    });
    const isLoginAlready = parent["isLoginAlready"];
    if(!isLoginAlready){
      await updateParentService({_id:parent["_id"]}, {"isLoginAlready":true});
    }
    return res.status(StatusCodes.OK).send(success(200, { accessToken, isLoginAlready }));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getParentController(req, res) {
  try {
    const id = req.parentId;
    const parent = await getParentService({_id:id}, {password:0, isActive:0});
    if (!parent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(400, "Parent not found"));
    }
    return res.status(StatusCodes.OK).send(success(200, parent));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateParentController(req, res){
  try {
    const id = req.parentId;
    const{username, fullname, age, gender, address, city, district, state, country, pincode, qualification, occupation, phone, email, password} = req.body;
    const fieldsToBeUpdated = {};

    if(username){
      const parent = await getParentService({ username, isActive: true, _id: { $ne: id } });
      if(parent){
        return res.status(StatusCodes.CONFLICT).send(error(409, "Username already exists. Try a different one."));
      }
      fieldsToBeUpdated["username"] = username;
     }
     if(phone){ 
      const parent = await getParentService({ phone, isActive: true, _id: { $ne: id } });
      if(parent){
        return res.status(StatusCodes.CONFLICT).send(error(409, "Phone already exists"));
      }
      fieldsToBeUpdated["phone"] = phone; 
    }
     if(email){ 
      const parent = await getParentService({ email, isActive: true, _id: { $ne: id } });
      if(parent){
        return res.status(StatusCodes.CONFLICT).send(error(409, "Email already exists"));
      }
      fieldsToBeUpdated["email"] = email;
    }

    if(fullname){ fieldsToBeUpdated["fullname"] = fullname; }
    if(age){ fieldsToBeUpdated["age"] = age; }
    if(gender){ fieldsToBeUpdated["gender"] = gender; }
    if(address){ fieldsToBeUpdated["address"] = address; }
    if(city){ fieldsToBeUpdated["city"] = city; }
    if(district){ fieldsToBeUpdated["district"] = district; }
    if(state){ fieldsToBeUpdated["state"] = state; }
    if(country){ fieldsToBeUpdated["country"] = country; }
    if(pincode){ fieldsToBeUpdated["pincode"] = pincode; }
    if(qualification){ fieldsToBeUpdated["qualification"] = qualification; }
    if(occupation){ fieldsToBeUpdated["occupation"] = occupation; }
    if(password){ fieldsToBeUpdated["password"] = await hashPasswordService(password); }

    const parent = await updateParentService({_id:id}, fieldsToBeUpdated);
    if(!parent){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Parent not found"));
    }
    return res.status(StatusCodes.OK).send(success(200, "User updated successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));   
  }
}

export async function passwordChangeController(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;
    const parentId = req.parentId;
    const parent = await getParentService({_id:parentId, isActive:true});
    if (!parent) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(404, "unauthorized user"));
    }
    const enteredPassword = oldPassword;
    const storedPassword = parent["password"];
    const matchPassword = await matchPasswordService({enteredPassword, storedPassword});
    if (!matchPassword) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(404, "Wrong password"));
    }
    const hashedPassword = await hashPasswordService(newPassword);
    await updateParentService({_id:parentId}, {password:hashedPassword});

    return res.status(StatusCodes.OK).send(success(200, "Password updated successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getChildrenParentController(req, res) {
  try {
    const id = req.parentId;
    const children = await getStudentsService({ parent: id, isActive:true }, {admin:0, isActive:0, parent:0}, [{ path: 'classId', select: 'name' }, { path: 'section', select: 'name' }]);
    return res.status(StatusCodes.OK).send(success(200, children));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}
