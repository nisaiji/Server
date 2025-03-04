import bcrypt from "bcrypt";
import { getAccessTokenService } from "../services/JWTToken.service.js";
import { matchPasswordService, hashPasswordService } from "../services/password.service.js"
import { StatusCodes } from "http-status-codes";
import { getSuperAdminService, registerSuperAdminService, updateSuperAdminService } from "../services/superAdmin.service.js";
import { error, success } from "../utills/responseWrapper.js";
import { getAdminCountService, getAdminService, getAdminsService, updateAdminService } from "../services/admin.services.js";
import { getCustomerSupportQueriesService } from "../services/customerSupport.services.js";

export async function registerSuperAdminController(req, res) {
  try {
    const { username, email, password } = req.body;
    let superAdmin = await getSuperAdminService({});
    if (superAdmin) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Super Admin already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    superAdmin = await registerSuperAdminService({ username, email, password: hashedPassword});


    return res.status(StatusCodes.CREATED).send(success(201, "User registered successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function loginSuperAdminController(req, res) {
  try {
    const { email, password } = req.body;
    const superAdmin = await getSuperAdminService({ email });
    if (!superAdmin) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(401, "Unauthorized user"));
    }
    const matchPassword = await matchPasswordService({enteredPassword:password, storedPassword:superAdmin["password"]});
    if (!matchPassword) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(401, "Unauthorized user"));
    }

    const accessToken = getAccessTokenService({
      role: "superadmin",
      id: superAdmin["_id"],
      username: superAdmin["username"],
      email: superAdmin["email"]
    });

    return res.status(StatusCodes.OK).send(success(200, { accessToken, username: superAdmin["username"] }));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateSuperAdminController(req, res) {
  try {
    const superAdminId = req.superAdminId;
    const superAdmin = await getSuperAdminService({_id: superAdminId});
    if (!superAdmin) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "User not exists"));
    }
    
    const updateFields = { };

    if(req.body["email"]){
      updateFields["email"] = req.body["email"];
    }
    if(req.body["username"]){
      updateFields["username"] = req.body["username"];
    }
    if (req.body["password"]) {
      updateFields["password"] = await hashPasswordService(req.body["password"]);
    }
    await updateSuperAdminService({_id:superAdminId}, updateFields);
    return res.status(StatusCodes.OK).send(success(200, "User updated successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getSuperAdminController(req, res) {
  try {
    const superAdminId = req.superAdminId;
    const superAdmin = await getSuperAdminService({ _id: superAdminId }, {email:1, username:1});
    if (!superAdmin) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Super Admin not found"));
    }
    return res.status(StatusCodes.OK).send(success(200, superAdmin));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getAdminsController(req, res){
  try {
    const{ nation, state, district, city, username, page = 1, limit = 1000 } = req.query;

    const filter = {};
    if (nation){ filter.nation = nation; }
    if (state){ filter.state = state; }
    if (district){ filter.district = district; }
    if (city){ filter.city = city; }
    if (username){ filter.username = new RegExp(username, 'i'); }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum-1)*limitNum;
    
    const admins = await getAdminsService(filter, {username:1}, skipNum, limitNum);
    const totalAdmins = await getAdminCountService(filter);
    const totalPages = Math.ceil(totalAdmins / limitNum);

    return res.status(StatusCodes.OK).send(success(200,{     
      admins,
      currentPage: pageNum,
      totalPages,
      totalAdmins,
      pageSize: limitNum,
    }))
    
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    
  }
}

export async function getCustomerQueriesController(req, res){
  try {
    const queries = await getCustomerSupportQueriesService({});

    return res.status(StatusCodes.OK).send(success(200,{ queries }));

  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    
  }
}

export async function updateAdminController(req, res){
  try {
    const adminId = req.params.adminId;
    const admin = await getAdminService({_id: adminId})
    const { active } = req.body;
    if(!admin){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Admin not found"))
    }
    if(active.toString() === admin['isActive'].toString()){
      return res.status(StatusCodes.BAD_REQUEST).send(success(400, `Admin already ${active ? "activated" : "deactivated"}`));
    }
    let statusChangeCount = admin['statusChangeCount'];
    statusChangeCount += 1;
    await updateAdminService({ _id: admin["_id"] }, {isActive: active, statusChangeCount, $push: {statusChangeLog: {status: active ? "activated": "deactivated"}}})
    return res.status(StatusCodes.OK).send(success(200, "Admin updated successfully"))
    
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}
