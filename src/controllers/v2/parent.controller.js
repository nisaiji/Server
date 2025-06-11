import otpGenerator from "otp-generator";
import { StatusCodes } from "http-status-codes";
import { error, success } from "../../utills/responseWrapper.js";
import { getOtpsPipelineService, registerOtpService, updateOtpService } from "../../services/otp.service.js";
import { sentSMSByTwillio } from "../../config/twilio.config.js";
import { getParentService, getParentsPipelineService, updateParentService } from "../../services/v2/parent.services.js";
import { sendEmailService } from "../../config/sendGrid.config.js";
import { getAccessTokenService } from "../../services/JWTToken.service.js";
import { hashPasswordService, matchPasswordService } from "../../services/password.service.js";
import { convertToMongoId } from "../../services/mongoose.services.js";
import { getStudentService, getStudentsPipelineService } from "../../services/student.service.js";
import { updateSchoolParentsService } from "../../services/v2/schoolParent.services.js";
import { getHolidayPipelineService } from "../../services/holiday.service.js";
import { getWorkdayPipelineService } from "../../services/workDay.services.js";

export async function parentSendOtpToPhoneController (req, res) {
  try {
    const { phone } = req.body;
    const parent = await getParentService({ phone });
    if(!parent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "User is not registered"))
    }
    // if(['phoneVerified', 'verified'].includes(parent['status'])) {
    //   return res.status(StatusCodes.CONFLICT).send(error(409, "Your Phone number already verified"))
    // }

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

    // if(['phoneVerified', 'verified'].includes(parent['status'])) {
    //   return res.status(StatusCodes.CONFLICT).send(error(409, "Your Phone number already verified"))
    // }

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

export async function parentPhoneUpdateSendOtpToPhoneController (req, res) {
  try {
    const { phone } = req.body;
    const parent = await getParentService({ phone, isActive: true });
    if(parent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Phone number already used"))
    }
    // if(['phoneVerified', 'verified'].includes(parent['status'])) {
    //   return res.status(StatusCodes.CONFLICT).send(error(409, "Your Phone number already verified"))
    // }

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

export async function parentPhoneUpdateVerifyByOtpController (req, res) {
  try {
    const { phone, otp } = req.body;
    const parentId = req.parentId;
    let parent = await getParentService({ _id:parentId, isActive: true });
    if(!parent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "User is not found"))
    }

    // if(['phoneVerified', 'verified'].includes(parent['status'])) {
    //   return res.status(StatusCodes.CONFLICT).send(error(409, "Your Phone number already verified"))
    // }

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
      updateParentService({_id: parent['_id']}, {phone}),
      updateSchoolParentsService({parent: parent['_id']}, {phone}),
      updateOtpService({_id: storedOtp['_id']}, {status: 'verified'})
    ]);

    res.status(StatusCodes.OK).send(success(200, "Phone updated successfully"));
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
    const rej = await sendEmailService(email, sms);
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

    // if(parent['status']==='phoneVerified') {
    //   return res.status(StatusCodes.BAD_REQUEST).send(error(404, "User email Verification is pending"));
    // }

    const enteredPassword = password;
    const storedPassword = parent.password;
    const matchPassword = await matchPasswordService({enteredPassword, storedPassword});
    if (!matchPassword) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(404, "Unauthorized user"));
    }

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
  } catch (err) {
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
    if(req.body['fcmToken']) { fieldsToBeUpdated['fcmToken'] = req.body['fcmToken'] }
    if (req.body["password"]) {
      const hashedPassword = await hashPasswordService(req.body["password"]);
      fieldsToBeUpdated.password = hashedPassword;
    }
    if(req.body["photo"] || req.body["method"]==="DELETE"){ 
      fieldsToBeUpdated['photo'] = (req.body["method"]==="DELETE")? "": req.body["photo"]; 
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
    parentStatus['studentAdded'] = parent['students']?.length > 0 ? true :false;

    return res.status(StatusCodes.OK).send(success(200, parentStatus))
    
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function checkValidStudentController(req, res) {
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
    // await updateParentService({_id: parentId},  { $push: { students: student['_id'] } });
    return res.status(StatusCodes.OK).send(success(200, students[0]));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function addStudentController(req, res) {
  try {
    const { studentIds } = req.body;
    const parentId = req.parentId;
    const parent = await getParentService({_id: parentId});
    if(!parent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Parent not found"));
    }

    const validStudentIds = [];

    for(const studentId of studentIds) {
      const pipeline = [
        {
          $match: {
            _id: convertToMongoId(studentId),
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
      console.log({students})
      if(students.length === 0 || parent?.students.some(id => id.equals(studentId))){
        continue
      }
      validStudentIds.push(studentId);
    }

    await updateParentService(
      { _id: parentId },
      { $addToSet: { students: { $each: validStudentIds } } }
    );

    return res.status(StatusCodes.OK).send(success(200, "Students added successfully"));
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
          let: { studentIds: '$students' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ['$_id', '$$studentIds'] },
                    { $eq: ['$isActive', true] }
                  ]
                }
              }
            }
          ],
          as: 'students'
        }
      },
      {
        $unwind: {
          path: "$students",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "sections",
          localField: "students.section",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: 1,
                startTime: 1
              }
            }
          ],
          as: "students.section"
        }
      },
      {
        $lookup: {
          from: "classes",
          localField: "students.classId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: 1
              }
            }
          ],
          as: "students.classId"
        }
      },
      {
        $lookup: {
          from: "admins",
          localField: "students.admin",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                schoolName: 1,
                principal: 1,
                schoolBoard: 1,
                phone: 1,
                email: 1,
                address: 1,
                city: 1,
                district: 1,
                state: 1,
                country: 1,
                pincode: 1
              }
            }
          ],
          as: "students.admin"
        }
      },
      {
        $unwind: { path: "$students.section", preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: "$students.classId", preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: "$students.admin", preserveNullAndEmptyArrays: true }
      },
      {
        $group: {
          _id: "$_id",
          username: { $first: "$username" },
          fullname: { $first: "$fullname" },
          phone: { $first: "$phone" },
          gender: { $first: "$gender" },
          address: { $first: "$address" },
          photo: { $first: "$photo" },
          city: { $first: "$city" },
          district: { $first: "$district" },
          status: { $first: "$status" },
          country: { $first: "$country" },
          pincode: {$first: '$pincode'},
          qualification: { $first: "$qualification" },
          occupation: { $first: "$occupation" },
          isLoginAlready: { $first: "$isLoginAlready" },
          email: { $first: "$email" },
          students: { $push: "$students" }
        }
      },
      {
        $project: {
          username: { $cond: [{ $ne: ["$username", null] }, "$username", "$$REMOVE"] },
          fullname: { $cond: [{ $ne: ["$fullname", null] }, "$fullname", "$$REMOVE"] },
          phone: { $cond: [{ $ne: ["$phone", null] }, "$phone", "$$REMOVE"] },
          gender: { $cond: [{ $ne: ["$gender", null] }, "$gender", "$$REMOVE"] },
          address: { $cond: [{ $ne: ["$address", null] }, "$address", "$$REMOVE"] },
          photo: { $cond: [{ $ne: ["$photo", null] }, "$photo", "$$REMOVE"] },
          city: { $cond: [{ $ne: ["$city", null] }, "$city", "$$REMOVE"] },
          district: { $cond: [{ $ne: ["$district", null] }, "$district", "$$REMOVE"] },
          status: { $cond: [{ $ne: ["$status", null] }, "$status", "$$REMOVE"] },
          country: { $cond: [{ $ne: ["$country", null] }, "$country", "$$REMOVE"] },
          pincode: { $cond: [{ $ne: ["$pincode", null] }, "$pincode", "$$REMOVE"] },
          qualification: { $cond: [{ $ne: ["$qualification", null] }, "$qualification", "$$REMOVE"] },
          occupation: { $cond: [{ $ne: ["$occupation", null] }, "$occupation", "$$REMOVE"] },
          isLoginAlready: { $cond: [{ $ne: ["$isLoginAlready", null] }, "$isLoginAlready", "$$REMOVE"] },
          email: { $cond: [{ $ne: ["$email", null] }, "$email", "$$REMOVE"] },
          students: 1
        }
      },      
      {
        $project: {
          password: 0
        }
      }
    ];
    
    const parents = await getParentsPipelineService(pipeline);
    if(parents.length <=0){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "User details not found"))
    }

    return res.status(StatusCodes.OK).send(success(200, parents[0]));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function editPasswordController(req, res) {
  try {
    const parentId = req.parentId || '67fe851bc9ae5cf26bfeab80';
    const { newPassword, oldPassword } = req.body;
    const parent = await getParentService({_id: parentId});
    if(!parent['password']) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Please complete your profile"));
    }
    const matchPassword = await matchPasswordService({enteredPassword: oldPassword, storedPassword: parent['password']});
    if (!matchPassword) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(404, "Please enter correct previous password"));
    }

    const hashedPassword = await hashPasswordService(newPassword);
    await updateParentService({_id: parentId}, {password: hashedPassword});
    return res.status(StatusCodes.OK).send(success(200, "Password updated successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function parentUpdateEmailAndSendEmailOtpController (req, res) {
  try {
    const { email } = req.body;
    const parentId = req.parentId;
    const emailParent = await getParentService({email, isActive: true});
    const parent = await getParentService({_id: parentId});
    if(emailParent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, 'Email already used'));
    }
    if(!parent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, 'User not found'));
    }

    const otp = otpGenerator.generate(5, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });
    const sms =`Your OTP for shareDRI is: ${otp}. This code is valid for 2 minutes. Do not share it with anyone.`;
    await registerOtpService({otp, identifier: email, otpType: 'emailVerification', medium: 'email', entityType: 'parent', expiredAt: new Date().getTime()+1000*60*5 })

    await sendEmailService(email, sms);
    res.status(StatusCodes.OK).send(success(200, "OTP send successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function parentUpdateEmailVerifyByOtpController (req, res) {
  try {
    const {email, otp } = req.body;
    const parentId = req.parentId;
    let parent = await getParentService({ _id: parentId });
    if(!parent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "User is not registered"))
    }

    const getOtpPipeline = [
      {
        $match: {
          identifier: email,
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

    if(storedOtp['status']==='verified' || storedOtp['status']==='expired' || storedOtp['expiredAt'] < new Date().getTime() ){
      return res.status(StatusCodes.BAD_REQUEST).send(error(404, 'Your OTP has expired'));
    }

    if(otp!==storedOtp['otp']) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(404, `You entered wrong OTP`));
    }

    await Promise.all([
      updateParentService({_id: parent['_id']}, { email }),
      updateSchoolParentsService({parent: parent['_id']}, {email}),
      updateOtpService({_id: storedOtp['_id']}, {status: 'verified'})
    ]);

    res.status(StatusCodes.OK).send(success(200, "Email updated successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getHolidayAndWorkdayController(req, res) {
  try {
   const parentId = req.parentId;
   const { studentId, startTime, endTime } = req.body;
   const student = await getStudentService({_id: studentId, isActive: true});
   if(!student) {
    return res.status(StatusCodes.NOT_FOUND).send(error(404, "Student not found"));
   }
   const pipeline = [
    {
      $match: {
        admin: convertToMongoId(student['admin']),
        date: { $gte: startTime, $lte: endTime }
      }
    }
   ];

   const holidays = await getHolidayPipelineService(pipeline);
   const workdays = await getWorkdayPipelineService(pipeline);

   return res.status(StatusCodes.OK).send(success(200, {holidays, workdays}));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}
