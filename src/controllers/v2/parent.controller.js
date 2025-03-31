// import otpGenerator from "otp-generator";
// import { StatusCodes } from "http-status-codes";
// import { error, success } from "../../utills/responseWrapper.js";
// import { config } from "../../config/config.js";
// import Twilio  from "twilio";
// import { getParentService, registerParentService } from "../../services/parent.services.js";
// import { registerOtpService } from "../../services/otp.service.js";

// export async function parentSignupController (req, res) {
//   try {
//     const { phone } = req.body;
//     const parent = await getParentService({ phone });
//     if(parent && ['phoneVerified', 'verified'].includes(parent['status'])) {
//       return res.status(StatusCodes.CONFLICT).send(error(409, "Phone number already registered"))
//     }

//     if (!parent) {
//      await registerParentService({phone, status: 'unVerified'});
//     }

//     const otp = otpGenerator.generate(5, {
//       lowerCaseAlphabets: false,
//       upperCaseAlphabets: false,
//       specialChars: false
//     });

//     await registerOtpService({otp, identifier: phone, otpType: 'register', medium: 'sms', entityType: 'parent', expiredAt: 111  })



//     res.send(success(200, message));
//   } catch (err) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
//   }
// }