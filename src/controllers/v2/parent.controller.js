import otpGenerator from "otp-generator";
import { StatusCodes } from "http-status-codes";
import { error, success } from "../../utills/responseWrapper.js";
import { getOtpsPipelineService, registerOtpService, updateOtpService } from "../../services/otp.service.js";
import { sentSMSByTwillio } from "../../config/twilio.config.js";
import { getParentService, getParentsPipelineService, updateParentService } from "../../services/v2/parent.services.js";
import { parentEmailVerification, sendEmailBySendGrid } from "../../config/sendGrid.config.js";
import { getAccessTokenService } from "../../services/JWTToken.service.js";
import { hashPasswordService, matchPasswordService } from "../../services/password.service.js";
import { convertToMongoId } from "../../services/mongoose.services.js";
import { getStudentsPipelineService } from "../../services/student.service.js";

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
    let parent = await getParentService({ phone });
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

    parent = await getParentService({ _id: parent['_id'] });
    const token = getAccessTokenService({
      parentId: parent['_id'],
      status: parent['status'],
      isLoginAlready: parent['isLoginAlready'],
      phoneVerified: parent['status'] !== 'unVerified',
      emailVerified: parent['status'] === 'verified',
      passwordUpdated: parent['password'] ? true : false,
      personalInfoUpdated: parent['fullname'] ? true : false
    })

    res.status(StatusCodes.OK).send(success(200, {message: "OTP verified successfully", token}));
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

    console.log('inside controller')
    const rej = await parentEmailVerification(email, sms);
    res.status(StatusCodes.OK).send(success(200, "OTP send successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function parentEmailVerifyByOtpController (req, res) {
  try {
    const { otp } = req.body;
    const parentId = req.parentId;
    let parent = await getParentService({ _id: parentId });
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

    parent = await getParentService({ _id: parent['_id'] });
    const token = getAccessTokenService({
      parentId: parent['_id'],
      status: parent['status'],
      isLoginAlready: parent['isLoginAlready'],
      phoneVerified: parent['status'] !== 'unVerified',
      emailVerified: parent['status'] === 'verified',
      passwordUpdated: parent['password'] ? true : false,
      personalInfoUpdated: parent['fullname'] ? true : false
    })

    res.status(StatusCodes.OK).send(success(200, { message: "OTP verified successfully" , token}));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function loginParentController(req, res) {
  try {
    const { user, password } = req.body;
    const parent = await getParentService({$or: [{username: user}, {email: user}, {phone:user}]});
    if (!parent) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(404, "Unauthorized user"));
    }
    if (parent['isActive']===false) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Services are temporarily paused. Please contact support"));
    }

    if(parent['status']==='unVerified') {
      return res.status(StatusCodes.BAD_REQUEST).send(error(404, "User verification is pending"));
    }

    if(parent['status']==='phoneVerified') {
      return res.status(StatusCodes.BAD_REQUEST).send(error(404, "User email Verification is pending"));
    }

    const enteredPassword = password;
    const storedPassword = parent.password;
    const matchPassword = await matchPasswordService({enteredPassword, storedPassword});
    // if (!matchPassword) {
    //   return res.status(StatusCodes.UNAUTHORIZED).send(error(404, "Unauthorized user"));
    // }

    const accessToken = getAccessTokenService({
      role: "parent",
      parentId: parent["_id"],
      phone: parent["phone"],
      email: parent["email"] ? parent['email'] : "",
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

export async function parentPasswordUpdateController(req, res) {
  try {
    const { password } = req.body;
    const parentId = req.parentId;
    await updateParentService({ _id: parentId }, { password });
    return res.status(StatusCodes.OK).send(success(200, 'Password updated successfully'));  
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateParentController(req, res) {
  try {
    const parentId = req.parentId;

    const fieldsToBeUpdated = {};
    if(req.body['username']) { fieldsToBeUpdated['username'] = req.body['username'] }
    if(req.body['fullname']) { fieldsToBeUpdated['fullname'] = req.body['fullname'] }
    if(req.body['gender']) { fieldsToBeUpdated['gender'] = req.body['gender'] }
    if(req.body['address']) { fieldsToBeUpdated['address'] = req.body['address'] }
    if(req.body['city']) { fieldsToBeUpdated['city'] = req.body['city'] }
    if(req.body['district']) { fieldsToBeUpdated['district'] = req.body['district'] }
    if(req.body['country']) { fieldsToBeUpdated['country'] = req.body['country'] }
    if(req.body['pincode']) { fieldsToBeUpdated['pincode'] = req.body['pincode'] }
    if(req.body['qualification']) { fieldsToBeUpdated['qualification'] = req.body['qualification'] }
    if(req.body['occupation']) { fieldsToBeUpdated['occupation'] = req.body['occupation'] }
    if (req.body["password"]) {
      const hashedPassword = await hashPasswordService(req.body["password"]);
      fieldsToBeUpdated.password = hashedPassword;
    }

    await updateParentService({ _id: parentId }, fieldsToBeUpdated);

    return res.status(StatusCodes.OK).send(success(200, "User updated successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getParentStatusController(req, res) {
  try {
    const { phone } = req.body;
    const parent = await getParentService({phone: phone, isActive: true})
    if(!parent){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "User not registered"))
    }
    const parentStatus = {
      isLoginAlready: false,
      phoneVerified: false,
      emailVerified: false,
      passwordUpdated: false,
      personalInfoUpdated: false,
    }

    parentStatus['status'] = parent['status'];
    parentStatus['isLoginAlready'] = parent['isLoginAlready'];
    parentStatus['phoneVerified'] = parent['status'] !== 'unVerified';
    parentStatus['emailVerified'] = parent['status'] === 'verified';
    parentStatus['passwordUpdated'] = parent['password'] ? true : false;
    parentStatus['personalInfoUpdated'] = parent['fullname'] ? true : false;

    return res.status(StatusCodes.OK).send(success(200, parentStatus))
    
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function addStudentController(req, res) {
  try {
    let { studentName } = req.body;
    const parentId = req.parentId;
    studentName = studentName.trim();
    const [firstname, lastname] = studentName.split(" ");
    const pipeline = [
      {
        $match: {
          firstname: { $regex: new RegExp(`^${firstname}$`, 'i') },
          lastname: { $regex: new RegExp(`^${lastname}$`, 'i') },
          isActive: true
        }
      },
      {
        $lookup: {
          from: "schoolparents",
          localField: "schoolParent",
          foreignField: "_id",
          as: "schoolParent"
        }
      },
      {
        $unwind: "$schoolParent"
      },
      {
        $match: {
          "schoolParent.parent": convertToMongoId(parentId)
        }
      }
    ];

    const students = await getStudentsPipelineService(pipeline);
    if(students.length === 0){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, 'Student not found!'));
    }
    const parent = await getParentService({_id: parentId});
    
    const student = students[0];
    if (parent?.students.some(id => id.equals(student._id))) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, 'Student already added'));
    }
    await updateParentService({_id: parentId},  { $push: { students: student['_id'] } });
    return res.status(StatusCodes.OK).send(success(200, students[0]));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getParentController(req, res) {
  try {
    const parentId = req.parentId;
    const pipeline = [
      {
        $match: {
          _id: convertToMongoId(parentId),
          isActive: true
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: 'students',
          foreignField: '_id',
          as:'students'
        }
      }
    ]

    const parent = await getParentsPipelineService(pipeline);

    return res.status(StatusCodes.OK).send(success(200, parent));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}
