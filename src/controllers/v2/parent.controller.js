import otpGenerator from "otp-generator";
import { StatusCodes } from "http-status-codes";
import { error, success } from "../../utills/responseWrapper.js";
import { getOtpsPipelineService, registerOtpService, updateOtpService } from "../../services/otp.service.js";
import { sentSMSByTwillio } from "../../config/twilio.config.js";
import { getParentService, updateParentService } from "../../services/v2/parent.services.js";
import { parentEmailVerification, sendEmailBySendGrid } from "../../config/sendGrid.config.js";
import { updateSchoolParentService } from "../../services/v2/schoolParent.services.js";
import { getAccessTokenService } from "../../services/JWTToken.service.js";

export async function parentSendOtpToPhoneController (req, res) {
  try {
    const { phone } = req.body;
    const parent = await getParentService({ phone });
    if(!parent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "User is not registered"))
    }
    if(['phoneVerified', 'verified'].includes(parent['status'])) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Your Phone number already verified"))
    }

    const otp = otpGenerator.generate(5, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });
    const sms =`Your OTP for shareDRI is: ${otp}. This code is valid for 2 minutes. Do not share it with anyone.`;
    await sentSMSByTwillio("+91"+phone,sms);
    await registerOtpService({otp, identifier: phone, otpType: 'phoneVerification', medium: 'sms', entityType: 'parent', expiredAt: new Date().getTime()+1000*60*5 })

    res.status(StatusCodes.OK).send(success(200, "OTP send successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function parentPhoneVerifyByOtpController (req, res) {
  try {
    const { phone, otp } = req.body;
    const parent = await getParentService({ phone });
    if(!parent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "User is not registered"))
    }
    if(['phoneVerified', 'verified'].includes(parent['status'])) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Your Phone number already verified"))
    }

    const getOtpPipeline = [
      {
        $match: {
          identifier: phone,
          medium: 'sms',
          entityType: 'parent',
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

    await Promise.all([
      updateParentService({_id: parent['_id']}, {status: 'phoneVerified'}),
      updateOtpService({_id: storedOtp['_id']}, {status: 'verified'})
    ]);

    res.status(StatusCodes.OK).send(success(200, "OTP verified successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function parentEmailInsertAndSendEmailOtpController (req, res) {
  try {
    const { email } = req.body;
    const parentId = req.parentId;
    const parent = await getParentService({_id: parentId});
    if(!parent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, 'User not found'));
    }
    if(parent['status']==='verified'){
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "User email has already been verified"));
    }
    const otp = otpGenerator.generate(5, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });
    const sms =`Your OTP for shareDRI is: ${otp}. This code is valid for 2 minutes. Do not share it with anyone.`;
    await registerOtpService({otp, identifier: email, otpType: 'emailVerification', medium: 'email', entityType: 'parent', expiredAt: new Date().getTime()+1000*60*5 })
    await updateParentService({_id: parent['_id']}, {email});

    await parentEmailVerification(email, sms);
    res.status(StatusCodes.OK).send(success(200, "OTP send successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function parentEmailVerifyByOtpController (req, res) {
  try {
    const { otp } = req.body;
    const parentId = req.parentId;
    const parent = await getParentService({ _id: parentId });
    if(!parent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "User is not registered"))
    }
    if(['verified'].includes(parent['status'])) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Your Email has already verified"))
    }

    const getOtpPipeline = [
      {
        $match: {
          identifier: parent['email'],
          medium: 'email',
          entityType: 'parent',
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
    console.log({storedOtp, now: new Date().getTime()})

    if(storedOtp['status']==='verified' || storedOtp['status']==='expired' || storedOtp['expiredAt'] < new Date().getTime() ){
      return res.status(StatusCodes.BAD_REQUEST).send(error(404, 'Your OTP has expired'));
    }

    if(otp!==storedOtp['otp']) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(404, `You entered wrong OTP`));
    }

    console.log("promise: ", {_id: storedOtp['_id']}, {status: 'verified'})
    await Promise.all([
      updateParentService({_id: parent['_id']}, {status: 'verified'}),
      updateOtpService({_id: storedOtp['_id']}, {status: 'verified'})
    ]);

    res.status(StatusCodes.OK).send(success(200, "OTP verified successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function loginParentController(req, res) {
  try {
    const { user, password } = req.body;
    const parent = await getParentService({$or: [{username: user}, {email: user}, {phone:user}], isActive:true});
    if (!parent) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(404, "Unauthorized user"));
    }
    const enteredPassword = password;
    const storedPassword = parent.password;
    // const matchPassword = await matchPasswordService({enteredPassword, storedPassword});
    // if (!matchPassword) {
    //   return res.status(StatusCodes.UNAUTHORIZED).send(error(404, "Unauthorized user"));
    // }
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
