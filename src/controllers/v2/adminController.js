import otpGenerator from "otp-generator";
import { getAdminService, registerAdminService, updateAdminService } from "../../services/admin.services.js";
import { sentSMSByTwillio } from "../../config/twilio.config.js";
import { getOtpsPipelineService, registerOtpService, updateOtpService } from "../../services/otp.service.js";
import { error, success } from "../../utills/responseWrapper.js";
import { adminControllerResponse } from "../../config/httpResponse.js";
import { hashPasswordService, matchPasswordService } from "../../services/password.service.js";
import { StatusCodes } from "http-status-codes";
import { sendEmailService } from "../../config/sendGrid.config.js";
import { getAccessTokenService, getRefreshTokenService } from "../../services/JWTToken.service.js";
import { verifyMsg91Token } from "../../services/msg91.service.js";

export async function adminSendOtpToPhoneController (req, res) {
  try {
    const { phone } = req.body;
    const admin = await getAdminService({ phone });
    if(admin) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Phone number already used"));
    }

    const otp = otpGenerator.generate(5, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });
    const sms =`Your OTP for shareDRI is: ${otp}. This code is valid for 2 minutes. Do not share it with anyone.`;
    await sentSMSByTwillio("+91"+phone, sms);
    await registerOtpService({otp, identifier: phone, otpType: 'phoneVerification', medium: 'sms', entityType: 'admin', expiredAt: new Date().getTime()+1000*60*5 });
    await registerAdminService({ phone, status: 'unVerified' });
    res.status(StatusCodes.OK).send(success(200, "OTP send successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err));
  }
}

export async function adminReSendOtpToPhoneController (req, res) {
  try {
    const { phone } = req.body;
    const admin = await getAdminService({ phone });
    if(!admin) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Invalid Phone number"));
    }

    const otp = otpGenerator.generate(5, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });
    const sms =`Your OTP for shareDRI is: ${otp}. This code is valid for 2 minutes. Do not share it with anyone.`;
    await sentSMSByTwillio("+91"+phone, sms);
    await registerOtpService({otp, identifier: phone, otpType: 'phoneVerification', medium: 'sms', entityType: 'admin', expiredAt: new Date().getTime()+1000*60*5 });
    res.status(StatusCodes.OK).send(success(200, "OTP send successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function adminPhoneVerifyByOtpController(req, res) {
  try {
    const { phone, otp } = req.body;
    let admin = await getAdminService({ phone });
    if(!admin) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "User not found"));
    }

    const getOtpPipeline = [
      {
        $match: {
          identifier: phone,
          medium: 'sms',
          entityType: 'admin',
          otpType: 'phoneVerification'
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $limit: 1
      }
    ]

    const otps = await getOtpsPipelineService(getOtpPipeline);
    const storedOtp = otps.length >= 1 ? otps[0] : null;
    if(!storedOtp) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, 'OTP has not been sent yet'));
    }

    if(storedOtp['status']==='verified' || storedOtp['status']==='expired' || storedOtp['expiredAt'] < new Date().getTime() ){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, 'Your OTP has expired'));
    }  
    
    if(otp!==storedOtp['otp']) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, `You entered wrong OTP`));
    }

    if(admin['status'] === 'unVerified') {
     await updateAdminService({_id: admin['_id']}, {status: 'phoneVerified'});
    }

    await updateOtpService({_id: storedOtp['_id']}, {status: 'verified'})
  

    admin = await getAdminService({_id: admin['_id']});
    const token = getAccessTokenService({
      adminId: admin['_id'],
      role: 'admin',
      status: admin['status'],
      isActive: admin['isActive'],
      phoneVerified: admin['status'] !== 'unVerified',
      emailVerified: admin['status'] === 'verified',
      passwordUpdated: admin['password'] ? true : false
    })


    res.status(StatusCodes.OK).send(success(200,  { msg: "OTP verified successfully", token}));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateAdminController(req, res) {
  try {
    const{schoolName, principal, schoolBoard, schoolNumber, password, affiliationNo, address,city,state,country, district, pincode, email, phone, username, photo, method, website, facebook, instagram, linkedin, twitter, whatsapp, youtube} = req.body;
    const fieldsToBeUpdated = {};
    const adminId = req.adminId;
    const condition = [];
    if(username){ condition.push({ username })};
    if(email){ condition.push({ email })};
    if(phone){ condition.push({ phone })};
    if(affiliationNo){ condition.push({ affiliationNo })};

    const admin = await getAdminService({$or: [{username}, {email}, {phone}, {affiliationNo}], _id:{$ne:adminId}});

    if(admin && username && admin["username"] && admin["username"]==username){
      return res.status(StatusCodes.CONFLICT).send(error(409, adminControllerResponse.updateAdminController.usernameExists));
    }
    if(admin && email && admin["email"]==email){
      return res.status(StatusCodes.CONFLICT).send(error(409, adminControllerResponse.updateAdminController.emailExists));
    }
    if(admin && phone && admin["phone"]==phone){
      return res.status(StatusCodes.CONFLICT).send(error(409, adminControllerResponse.updateAdminController.phoneExists));
    }
    if(admin && affiliationNo && admin["affiliationNo"] && admin["affiliationNo"]==affiliationNo){
      return res.status(StatusCodes.CONFLICT).send(error(409, adminControllerResponse.updateAdminController.affiliationExists));
    }

    if(password) {
      fieldsToBeUpdated['password'] = await hashPasswordService(password);
    }
    if(schoolName){ fieldsToBeUpdated["schoolName"] = schoolName; }
    if(principal){ fieldsToBeUpdated["principal"] = principal; }
    if(schoolBoard){ fieldsToBeUpdated["schoolBoard"] = schoolBoard; }
    if(schoolNumber){ fieldsToBeUpdated["schoolNumber"] = schoolNumber; }
    if(affiliationNo){ fieldsToBeUpdated["affiliationNo"] = affiliationNo; }
    if(address){ fieldsToBeUpdated["address"] = address; }
    if(city){ fieldsToBeUpdated["city"] = city; }
    if(district){ fieldsToBeUpdated["district"] = district; }
    if(state){ fieldsToBeUpdated["state"] = state; }
    if(country){ fieldsToBeUpdated["country"] = country; }
    if(pincode){ fieldsToBeUpdated["pincode"] = pincode; }
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
    if(linkedin){ fieldsToBeUpdated["linkedin"] = linkedin; }
    if (photo || method === "DELETE") {
      fieldsToBeUpdated.photo = method === "DELETE" ? "" : photo;
    }

    await updateAdminService({_id:adminId}, fieldsToBeUpdated);

    return res.status(StatusCodes.OK).send(success(200, adminControllerResponse.updateAdminController.adminUpdatedSuccessfully));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function adminSendOtpToEmailController(req, res) {
  try {
    const { email } = req.body;
    const adminId = req.adminId;
    const admin = await getAdminService({ _id: adminId });
    if(!admin) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Admin not found"));
    }

    if(admin['status']==='verified'){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "User email has already been verified"));
    }
    const otp = otpGenerator.generate(5, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });
    const sms =`Your OTP for shareDRI is: ${otp}. This code is valid for 2 minutes. Do not share it with anyone.`;
    await registerOtpService({otp, identifier: email, otpType: 'emailVerification', medium: 'email', entityType: 'admin', expiredAt: new Date().getTime()+1000*60*5 })
    await updateAdminService({_id: admin['_id']}, {email});
    await sendEmailService(email, sms);
    res.status(StatusCodes.OK).send(success(200, "OTP send successfully"));    
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function adminEmailVerifyByOtpController(req, res) {
  try {
    const { otp } = req.body;
    const adminId = req.adminId;
    let admin = await getAdminService({ _id: adminId });
    if(!admin) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "User not found"));
    }
    if(['verified'].includes(admin['status'])) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Your Email has already verified"))
    }

    const getOtpPipeline = [
      {
        $match: {
          identifier: admin['email'],
          medium: 'email',
          entityType: 'admin',
          otpType: 'emailVerification'
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $limit: 1
      }
    ]

    const otps = await getOtpsPipelineService(getOtpPipeline);
    const storedOtp = otps.length >= 1 ? otps[0] : null;
    if(!storedOtp) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, 'OTP has not been sent yet'));
    }

    if(storedOtp['status']==='verified' || storedOtp['status']==='expired' || storedOtp['expiredAt'] < new Date().getTime() ){
      return res.status(StatusCodes.BAD_REQUEST).send(error(404, 'Your OTP has expired'));
    }

    if(otp!==storedOtp['otp']) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(404, `You entered wrong OTP`));
    }

    await Promise.all([
      updateAdminService({_id: admin['_id']}, {status: 'verified'}),
      updateOtpService({_id: storedOtp['_id']}, {status: 'verified'})
    ]);

    admin = await getAdminService({ _id: admin['_id'] });
    const token = getAccessTokenService({
      role: "admin",
      adminId : admin['_id'],
      email: admin["email"],
      status: admin['status'],
      phone: admin["phone"],
      active: admin["isActive"],
      pincode: admin['pincode'] ? admin['pincode'] : '',
      isLoginAlready: admin['isLoginAlready'],
    })

    res.status(StatusCodes.OK).send(success(200, { message: "OTP verified successfully" , token}));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function adminGetStatusController(req, res) {
  try {
    const { phone }  = req.body;
    const admin = await getAdminService({ phone });
    if(!admin) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, 'Admin not found'));
    }

    const status = {
      phoneVerified: admin['status'] !== 'unVerified',
      emailVerified: admin['status'] === 'verified',
      passwordUpdated: !!admin['password'],
      affiliationExists: !!admin['affiliationNo'],
      status: admin['status'],
      addressUpdated: !!admin['address'],
      isActive: admin["isActive"]
    }

    return res.status(StatusCodes.OK).send(success(200, status));
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function adminLoginController(req, res) {
  try {
    const { user, password } = req.body;
  
    const admin = await getAdminService({ $or: [{email: user}, {phone: user}, {status: 'verified'}] });
    if (!admin) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(401, adminControllerResponse.loginController.unathorized));
    }
    // if(!admin['isActive']){
    //   return res.status(StatusCodes.FORBIDDEN).send(error(403, "Services are temporarily paused. Please contact support."))
    // }
    const storedPassword = admin.password;
    const enteredPassword = password;
    const matchPassword = await matchPasswordService({ enteredPassword, storedPassword });
    if (!matchPassword) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(401, adminControllerResponse.loginController.unathorized));
    }
    const accessToken = getAccessTokenService({
      role: "admin",
      username: admin["username"] ? admin['username'] : '',
      schoolName: admin["schoolName"],
      email: admin["email"],
      adminId: admin["_id"],
      phone: admin["phone"],
      status: admin["status"],
      active: admin["isActive"],
      pincode: admin['pincode'] ? admin['pincode'] : ''
    });

    const refreshToken = getRefreshTokenService({
      role: "admin",
      username: admin["username"] ? admin['username'] : '',
      schoolName: admin["schoolName"],
      email: admin["email"],
      adminId: admin["_id"],
      phone: admin["phone"],
      active: admin["isActive"],
      pincode: admin['pincode'] ? admin['pincode'] : ''
    });
    return res.status(StatusCodes.OK).send(success(200, { accessToken, refreshToken, username: admin.username }));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function adminPhoneVerifyController(req, res) {
  try {
     const { phone, token } = req.body;
    let admin = await getAdminService({ phone });

    const response = await verifyMsg91Token(token);
    if(response?.type !== 'success') {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, response?.message || "Token can't verified"));
    }

    if(!admin) {
      await registerAdminService({ phone, status: 'phoneVerified' });
    }

    admin = await getAdminService({phone});
    const jwttoken = getAccessTokenService({
      adminId: admin['_id'],
      role: 'admin',
      status: admin['status'],
      isActive: admin['isActive'],
      phoneVerified: admin['status'] !== 'unVerified',
      emailVerified: admin['status'] === 'verified',
      passwordUpdated: admin['password'] ? true : false
    })

    res.status(StatusCodes.OK).send(success(200,  { msg: "OTP verified successfully", token: jwttoken}));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function adminEmailVerifyController(req, res) {
  try {
    const { email, token } = req.body;
    const adminId = req.adminId;

    let admin = await getAdminService({ _id: adminId });
    if(!admin) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Admin not found"));
    }
    const response =  await verifyMsg91Token(token);
        
    if(response?.type !== 'success') {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, response?.message || "Token can't verified"));
    }

    await updateAdminService({_id: admin['_id']}, {email, status: 'verified'});

    admin = await getAdminService({ _id: admin['_id'] });
    const jwtToken = getAccessTokenService({
      role: "admin",
      adminId : admin['_id'],
      email: admin["email"],
      status: admin['status'],
      phone: admin["phone"],
      active: admin["isActive"],
      pincode: admin['pincode'] ? admin['pincode'] : '',
      isLoginAlready: admin['isLoginAlready'],
    });

    return res.status(StatusCodes.OK).send(success(200, {message: "Email updated successfully", token: jwtToken}));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}