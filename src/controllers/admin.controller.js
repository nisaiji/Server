import { getAccessTokenService } from "../services/JWTToken.service.js";
import { error, success } from "../utills/responseWrapper.js";
import bcrypt from "bcrypt";
import {getAdminService, registerAdminService, updateAdminByIdService } from "../services/admin.services.js";
import { hashPasswordService, matchPasswordService } from "../services/password.service.js";
import { StatusCodes } from "http-status-codes";

export async function registerAdminController(req, res) {
  try {
    const {affiliationNo, email, phone, username, password } = req.body;
    const admin = await getAdminService({$or:[{username}, {email}, {affiliationNo}, {phone}],isActive:true});
    if (admin && admin?.username === username) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Admin name already exist"));
    }
    if (admin && admin?.email === email) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Email already exist"));
    }
    if (admin && admin?.affiliationNo === affiliationNo) {
      return res.status(StatusCodes.CONFLICT).send(error(400, "Affiliation no already exist"));
    }
    if (admin && admin?.phone === phone) {
      return res.status(StatusCodes.CONFLICT).send(error(400, "Phone number already exist"));
    }
    const hashedPassword = await hashPasswordService(password);
    req.body["password"] = hashedPassword;
    await registerAdminService(req.body);
   
    return res.status(StatusCodes.CREATED).send(success(201, "Admin registered successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function loginAdminController(req, res) {
  try {
    const { email, password } = req.body;
  
    const admin = await getAdminService({ email, isActive:true });
    if (!admin) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(401, "Unauthorized user"));
    }
    const storedPassword = admin.password;
    const enteredPassword = password;
    const matchPassword = await matchPasswordService({ enteredPassword, storedPassword });
    if (!matchPassword) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(401, "Unauthorized user"));
    }
    const accessToken = getAccessTokenService({
      role: "admin",
      username: admin["username"],
      schoolName: admin["schoolName"],
      email: admin["email"],
      adminId: admin["_id"],
      phone: admin["phone"]
    });
    return res.status(StatusCodes.OK).send(success(200, { accessToken, username: admin.username }));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateAdminController(req, res) {
  try {
    const{schoolName,principal,schoolBoard, schoolNumber, affiliationNo, address,city,state, email, phone, username, website, facebook, instagram, linkedin, twitter, whatsapp, youtube} = req.body;
    const fieldsToBeUpdated = {};
    const adminId = req.adminId;
    const duplicateAdmin = await getAdminService({$or: [{username}, {email}, {phone}], _id:{$ne:adminId}});
    if(duplicateAdmin && duplicateAdmin["username"]==username){
      return res.status(StatusCodes.CONFLICT).send(error(409, "Username already exists."));
    }
    if(duplicateAdmin && duplicateAdmin["email"]==email){
      return res.status(StatusCodes.CONFLICT).send(error(409, "Email already exists."));
    }
    if(duplicateAdmin && duplicateAdmin["phone"]==phone){
      return res.status(StatusCodes.CONFLICT).send(error(409, "Phone already exists."));
    }

    if(schoolName){ fieldsToBeUpdated["schoolName"] = schoolName; }
    if(principal){ fieldsToBeUpdated["principal"] = principal; }
    if(schoolBoard){ fieldsToBeUpdated["schoolBoard"] = schoolBoard; }
    if(schoolNumber){ fieldsToBeUpdated["schoolNumber"] = schoolNumber; }
    if(affiliationNo){ fieldsToBeUpdated["affiliationNo"] = affiliationNo; }
    if(address){ fieldsToBeUpdated["address"] = address; }
    if(city){ fieldsToBeUpdated["city"] = city; }
    if(state){ fieldsToBeUpdated["state"] = state; }
    if(email){ fieldsToBeUpdated["email"] = email; }
    if(phone){ fieldsToBeUpdated["phone"] = phone; }
    if(username){ fieldsToBeUpdated["username"] = username; }
    if(website){ fieldsToBeUpdated["website"] = website; }
    if(facebook){ fieldsToBeUpdated["facebook"] = facebook; }
    if(instagram){ fieldsToBeUpdated["instagram"] = instagram; }
    if(instagram){ fieldsToBeUpdated["instagram"] = instagram; }
    if(twitter){ fieldsToBeUpdated["twitter"] = twitter; }
    if(whatsapp){ fieldsToBeUpdated["whatsapp"] = whatsapp; }
    if(youtube){ fieldsToBeUpdated["youtube"] = youtube; }

    await updateAdminByIdService({id:adminId, fieldsToBeUpdated});

    return res.status(StatusCodes.OK).send(success(200, "Admin updated successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getAdminController(req, res) {
  try {
    const adminId = req.adminId;
    const admin = await getAdminService({_id:adminId, isActive:true});
    return res.status(StatusCodes.OK).send(success(200, admin));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}
