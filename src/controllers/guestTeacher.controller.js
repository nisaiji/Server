import { StatusCodes } from "http-status-codes";
import { error, success } from "../utills/responseWrapper.js";
import { getGuestTeacherService, updateGuestTeacherService } from "../services/guestTeacher.service.js";
import { hashPasswordService } from "../services/password.service.js";


// export async function loginGuestTeacherController(req, res) {
//   try {
//     const { username, password } = req.body;
//     const guestTeacher = await getGuestTeacherService({username})
//      if (!guestTeacher) {
//       return res.status(StatusCodes.UNAUTHORIZED).send(error(404, "Unauthorized  username"));
//     }
//     const matchPassword = await matchPasswordService({enteredPassword:password,storedPassword:guestTeacher["password"]});
//     if (!matchPassword) {
//       return res.status(StatusCodes.UNAUTHORIZED).send(error(404, "Unauthorized  user"));
//     }
//     const section = await getSectionService({_id: guestTeacher["section"]});
//     if (!section) {
//       return res.status(StatusCodes.BAD_REQUEST).send(error(400, "section not found"));
//     }
//     const Class = await getClassService({ _id:section["classId"] });
//     const accessToken = getAccessTokenService({
//       role: "guestTeacher",
//       guestTeacherId: guestTeacher["_id"],
//       adminId: guestTeacher["admin"],
//       sectionId: section["_id"],
//       classId: Class["_id"],
//       sectionName: section["name"],
//       className: Class["name"],
//       username: guestTeacher["username"]
//     });
//     const refreshToken = getRefreshTokenService({
//       role: "guestTeacher",
//       guestTeacherId: guestTeacher["_id"],
//       adminId: guestTeacher["admin"],
//       sectionId: section["_id"],
//       classId: Class["_id"],
//       sectionName: section["name"],
//       className: Class["name"],
//       username: guestTeacher["username"]
//     });
//     return res.status(StatusCodes.OK).send(success(200, {accessToken, refreshToken, username: guestTeacher["username"]}));
//   } catch (err) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
//   }
// }

export async function updateGuestTeacherController(req, res) {
  try {
    const teacherId = req.teacherId;
    const { username, tagline, password } = req.body;
    const guestTeacher = await getGuestTeacherService({_id: teacherId})
     if (!guestTeacher) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(404, "Teacher not found"));
    }
    const fieldsToBeUpdated = {}
    if(username){ fieldsToBeUpdated['username'] = username }
    if(tagline){ fieldsToBeUpdated['tagline'] = tagline }
    if(password){ fieldsToBeUpdated['password'] = await hashPasswordService(password) }
    await updateGuestTeacherService({_id: teacherId}, fieldsToBeUpdated)
 
    return res.status(StatusCodes.OK).send(success(200, "Teacher updated successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}
