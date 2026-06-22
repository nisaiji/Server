import { StatusCodes } from "http-status-codes";
import { getTeacherService, registerTeacherService, getAllTeacherOfAdminService, updateTeacherService, getTeachersService, getTeachersPipelineService } from "../services/teacher.services.js";
import { getTeacherSectionSessionService, getTeacherSectionSessionsService } from "../services/teacherSectionSession.service.js";
import { matchPasswordService, hashPasswordService } from "../services/password.service.js";
import { error, success } from "../utils/responseWrapper.js";
import { getAccessTokenService, getRefreshTokenService } from "../services/JWTToken.service.js";
import { getSectionService } from "../services/section.services.js";
import { getClassService } from "../services/class.services.js";
import { convertToMongoId, isValidMongoId } from "../services/mongoose.services.js";
import { getGuestTeacherService } from "../services/guestTeacher.service.js";
import { getAdminService } from "../services/admin.services.js";
import { getSessionService } from "../services/session.services.js";
import xlsx from 'xlsx';
import fs from 'fs/promises';

export async function registerTeacherController(req, res) {
  try {
    const adminId = req.adminId;
    const { firstname, phone } = req.body;
    const teacher = await getTeacherService({ phone, isActive: true });
    if (teacher) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Phone number already registered"));
    }
    const password = firstname + "@" + phone;
    const hashedPassword = await hashPasswordService(password);
    req.body["password"] = hashedPassword;
    req.body["admin"] = adminId;
    await registerTeacherService(req.body);
    return res.status(StatusCodes.CREATED).send(success(201, "Teacher registered successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function loginTeacherController(req, res) {
  try {
    const { user, password, platform, deviceId } = req.body;
    const [teacher, guestTeacher] = await Promise.all([
      getTeacherService({isActive: true, $or: [{ username: user }, { phone: user }, { email: user?.toLowerCase() }]}),
      getGuestTeacherService({ username: user, isActive:true })
    ]);

    const currentTeacher = teacher ? teacher : guestTeacher;

    if (!currentTeacher) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Invalid credentials. Please try again"));
    }
    // if (!currentTeacher['isActive']) {
    //   return res.status(StatusCodes.NOT_FOUND).send(error(404, "User not found. Please check your credentials."))                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               "));
    // }
    const admin = await getAdminService({_id: currentTeacher['admin']});
    if (!admin){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Admin not found"));
    }

    if(admin && !admin['isActive']){
      return res.status(StatusCodes.GONE).send(error(410, "Services are temporarily paused. Please contact support."));
    }
    if (teacher && platform==='app' && !deviceId) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Device Id is required"));
    }
    const matchPassword = await matchPasswordService({ enteredPassword: password, storedPassword: currentTeacher["password"] });
    if (!matchPassword) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(404, "Invalid credentials. Please try again"));
    }

    const session = await getSessionService({school: admin['_id'], status: "active"});
    if (!session) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session not found"));
    }
    if (guestTeacher && platform === "web") {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Guest teacher does not support on web"));
    }
    let section;
    let Class;
    const teacherSectionSession = await getTeacherSectionSessionService({ teacher: currentTeacher['_id'], session: session['_id'] });
    if (teacherSectionSession) {
      [section, Class] = await Promise.all([
        getSectionService({ _id: teacherSectionSession.section}),
        getClassService({ _id: teacherSectionSession.classInfo})
      ]);
    }
    // if (!section) {
    //   return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Teacher is not assigned to any section"));
    // }

    if(platform=='app' && teacher && teacher['isLoginAlready'] && teacher['deviceId']!==deviceId){
      return res.status(StatusCodes.UNAUTHORIZED).send(error(401, "Access denied due to device mismatch"));
    }

    const accessToken = getAccessTokenService({
      role: teacher ? (teacherSectionSession ? "classTeacher" : "teacher") : "guestTeacher",
      teacherId: currentTeacher["_id"],
      adminId: currentTeacher["admin"],
      sectionId: section? section["_id"]:"",
      sectionStart: section? section['startTime']:"",
      classId: Class?Class["_id"]:"",
      sectionName: section? section["name"] : "",
      className: Class ? Class["name"] : "",
      schoolName: admin['schoolName'],
      sessionId: section? section["session"]: "",
      tagline: guestTeacher ? guestTeacher['tagline'] :"",
      phone: currentTeacher["phone"] ? currentTeacher["phone"] : "",
      email: currentTeacher["email"] ? currentTeacher["email"] : "",
      pincode: currentTeacher["pincode"] ? currentTeacher["pincode"] : "",
      username: currentTeacher["username"] ? currentTeacher["username"] : "",
    });
    const refreshToken = getRefreshTokenService({
      role: teacher ? (teacherSectionSession ? "classTeacher" : "teacher") : "guestTeacher",
      teacherId: currentTeacher["_id"],
      adminId: currentTeacher["admin"],
      sectionId: section?section["_id"]:"",
      classId: Class?Class["_id"]:"",
      sectionName: section? section["name"] : "",
      className: Class ? Class["name"] : "",
      phone: currentTeacher["phone"] ? currentTeacher["phone"] : "",
      email: currentTeacher["email"] ? currentTeacher["email"] : "",
      pincode: currentTeacher["pincode"] ? currentTeacher["pincode"] : "",
      username: currentTeacher["username"] ? currentTeacher["username"] : ""
    });
    let isLoginAlready = true;
    if (platform==='app' && !currentTeacher['isLoginAlready']) {
      isLoginAlready = currentTeacher["isLoginAlready"];
      currentTeacher["isLoginAlready"] = true;
      currentTeacher['deviceId'] = deviceId;
      await currentTeacher.save();
    }
    return res.status(StatusCodes.OK).send(success(200, { accessToken, refreshToken, firstname: teacher ? teacher["firstname"] : "",isLoginAlready }));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function refreshAccessTokenController(req, res) {
  try {
    const data = req.data;
    const accessToken = getAccessTokenService(data);
    return res.status(StatusCodes.OK).send(success(200, { accessToken }));
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getAllTeacherOfAdminController(req, res) {
  try {
    const adminId = req.adminId;
    const {sessionId} = req.body;
    const teachers = await getTeachersPipelineService([
      {
        $match: { admin: convertToMongoId(adminId), isActive: true }
      },
      {
        $lookup: {
          from: "teachersectionsessions",
          let: { teacherId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$teacher", "$$teacherId"] },
                    { $eq: ["$session", convertToMongoId(sessionId)] }
                  ]
                }
              }
            },
            {
              $lookup: {
                from: "sections",
                localField: "section",
                foreignField: "_id",
                as: "sectionInfo"
              }
            },
            {
              $unwind: {
                path: "$sectionInfo",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: "classes",
                localField: "classInfo",
                foreignField: "_id",
                as: "classInfo"
              }
            },
            {
              $unwind: {
                path: "$classInfo",
                preserveNullAndEmptyArrays: true
              }
            }
          ],
          as: "teacherSectionSession"
        }
      },
      {
        $unwind: {
          path: "$teacherSectionSession",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "teachersubjectsections",
          localField: "_id",
          foreignField: "teacher",
          as: "sectionSubjects",
          pipeline: [
            {
              $lookup: {
                from: "subjects",
                localField: "subject",
                foreignField: "_id",
                as: "subject",
              }
            },
            {
              $unwind: {
                path: "$subject",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: "sections",
                localField: "section",
                foreignField: "_id",
                as: "section",
              }
            },
            {
              $unwind: {
                path: "$section",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: "classes",
                localField: "classId",
                foreignField: "_id",
                as: "class",
              }
            },
            {
              $unwind: {
                path: "$class",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                _id: 0,
                teacherSubjectSectionId: "$_id",
                subjectId: "$subject._id",
                subjectName: "$subject.name",
                classId: "$class._id",
                className: "$class.name",
                sectionId: "$section._id",
                sectionName: "$section.name"
              }
            }
          ]
        }
      },
      {
        $project: {
          id: "$_id",
          teacherId: "$teacherId",
          username: "$username",
          firstname: "$firstname",
          lastname: "$lastname",
          isLoginAlready: "$isLoginAlready",
          fcmToken: "$fcmToken",
          deviceId: "$deviceId",
          dob: "$dob",
          bloodGroup: "$bloodGroup",
          email: "$email",
          isActive: "$isActive",
          gender: "$gender",
          university: "$university",
          degree: "$degree",
          phone: "$phone",
          address: "$address",
          city: "$city",
          district: "$district",
          state: "$state",
          country: "$country",
          pincode: "$pincode",
          photo: "$photo",
          forgetPasswordCount: "$forgetPasswordCount",
          leaveRequestCount: "$leaveRequestCount",
          section: "$teacherSectionSession.sectionInfo",
          admin: "$admin",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          sectionId: "$teacherSectionSession.sectionInfo._id",
          sectionName: "$teacherSectionSession.sectionInfo.name",
          sectionStudentCount: "$teacherSectionSession.sectionInfo.studentCount",
          sectionStartTime: "$teacherSectionSession.sectionInfo.startTime",
          classId: "$teacherSectionSession.classInfo._id",
          className: "$teacherSectionSession.classInfo.name",
          sectionCountInClass: { $size: { $ifNull: ["$teacherSectionSession.classInfo.section", []] } },
          sectionSubjects: "$sectionSubjects",
        }
      },
      {
        $project: {
          teacherSectionSession: 0,
          _id: 0
        }
      }
    ]);
    const teachersWithRole = teachers.map(t => {
      const hasSection = t.sectionId && String(t.sectionId).trim() !== "";
      return { ...t, role: hasSection ? "classTeacher" : "teacher" };
    });
    // const teachers = await getAllTeacherOfAdminService(adminId);
    return res.status(StatusCodes.OK).send(success(200, teachersWithRole));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateTeacherController(req, res) {
  try {
    const teacherId = req.teacherId ? req.teacherId : req.params.teacherId;
    const {
      username,
      firstname,
      lastname,
      dob,
      bloodGroup,
      email,
      gender,
      university,
      degree,
      password,
      phone,
      address,
      city,
      state,
      country,
      district,
      pincode,
      photo,
      method,
      fcmToken
    } = req.body;

    if (!isValidMongoId(teacherId)) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Invalid teacher Id"));
    }
    const teacher = await getTeacherService({ _id: teacherId, isActive: true });
    if (!teacher) {
      return res.status(StatusCodes.GONE).send(error(410, "User not found"));
    }

    const fieldsToBeUpdated = {};
    if (email) {
      const teacher = await getTeacherService({_id: { $ne: teacherId }, email, isActive: true });
      if (teacher) {
        return res.status(StatusCodes.CONFLICT).send(error(409, "Email already registered"));
      }
      fieldsToBeUpdated.email = email;
    }

    if (username) {
      const teacher = await getTeacherService({_id: { $ne: teacherId }, username, isActive: true });
      if (teacher) {
        return res.status(StatusCodes.CONFLICT).send(error(409, "Username already exists. Try a different one"));
      }
      fieldsToBeUpdated.username = username;
    }

    if (phone) {
      const teacher = await getTeacherService({_id: { $ne: teacherId }, phone, isActive: true });
      if (teacher) {
        return res.status(StatusCodes.CONFLICT).send(error(409, "Phone already registered"));
      }
      fieldsToBeUpdated.phone = phone;
    }

    if (req.body["password"]) {
      const hashedPassword = await hashPasswordService(req.body["password"]);
      fieldsToBeUpdated.password = hashedPassword;
    }

    if (firstname) {
      fieldsToBeUpdated.firstname = firstname;
    }
    if (lastname) {
      fieldsToBeUpdated.lastname = lastname;
    }
    if (dob) {
      fieldsToBeUpdated.dob = dob;
    }
    if (bloodGroup) {
      fieldsToBeUpdated.bloodGroup = bloodGroup;
    }
    if (gender) {
      fieldsToBeUpdated.gender = gender;
    }
    if (university) {
      fieldsToBeUpdated.university = university;
    }
    if (degree) {
      fieldsToBeUpdated.degree = degree;
    }
    if (address) {
      fieldsToBeUpdated["address"] = address;
    }
    if (city) {
      fieldsToBeUpdated["city"] = city;
    }
    if (district) {
      fieldsToBeUpdated["district"] = district;
    }
    if (state) {
      fieldsToBeUpdated["state"] = state;
    }
    if (country) {
      fieldsToBeUpdated["country"] = country;
    }
    if (pincode) {
      fieldsToBeUpdated["pincode"] = pincode;
    }
    if (fcmToken) {
      fieldsToBeUpdated["fcmToken"] = fcmToken;
    }
    if (photo || method === "DELETE") {
      fieldsToBeUpdated.photo = method === "DELETE" ? "" : photo;
    }

    await updateTeacherService({ _id: teacherId }, fieldsToBeUpdated);

    return res.status(StatusCodes.OK).send(success(200, "Teacher updated successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function deleteTeacherController(req, res) {
  try {
    const teacherId = req.params.teacherId;
    if (!isValidMongoId(teacherId)) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Invalid Teacher Id"));
    }

    const teacher = await getTeacherService({ _id: teacherId, isActive: true });
    if (!teacher) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Teacher not found"));
    }
    if (teacher["section"]) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Cannot delete the teacher as they are assigned to a section"));
    }
    await updateTeacherService({ _id: teacher["_id"] }, { isActive: false });
    return res.status(StatusCodes.OK).send(success(200, "Teacher deleted successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getTeacherController(req, res) {
  try {
    const id = req.params.teacherId ? req.params.teacherId : req.teacherId;
    if (!isValidMongoId(id)) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Invalid teacher Id"));
    }
    const teacher = await getTeacherService({ _id: id, isActive: true }, {password:0});
    if (!teacher) {
      return res.status(StatusCodes.NOT_FOUND).send(success(404, "User not found"));
    }
    const teacherInfo = await getTeachersPipelineService([
      {
        $match: { _id: convertToMongoId(id) }
      },
      {$lookup: {
        from: "sessions",
        localField: "admin",
        foreignField: "school",
        as: "session",
        pipeline: [
          { $match: { status: "active" } },
          { $sort: { createdAt: -1 } },
          { $limit: 1 }
        ]
       }
      },
       {
         $unwind: {
           path: "$session", 
           preserveNullAndEmptyArrays: true
         }
      },
      {
        $lookup: {
          from: "sections",
          localField: "section",
          foreignField: "_id",
          as: "section"
        }
      },
      {
         $unwind: {
           path: "$section", 
           preserveNullAndEmptyArrays: true
         }
      },
      {
        $lookup: {
          from: "classes",
          localField: "section.classId",
          foreignField: "_id",
          as:"class"
        }
      },
      {
        $unwind: {
          path: "$class",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "teachersubjectsections",
          localField: "_id",
          foreignField: "teacher",
          as: "sectionSubjects",
          pipeline: [
            {
              $lookup: {
                from: "subjects",
                localField: "subject",
                foreignField: "_id",
                as: "subject",
              }
            },
            {
              $unwind: {
                path: "$subject",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: "sections",
                localField: "section",
                foreignField: "_id",
                as: "section",
              }
            },
            {
              $unwind: {
                path: "$section",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: "classes",
                localField: "classId",
                foreignField: "_id",
                as: "class",
              }
            },
            {
              $unwind: {
                path: "$class",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                _id: 0,
                teacherSubjectSectionId: "$_id",
                subjectId: "$subject._id",
                subjectName: "$subject.name",
                classId: "$class._id",
                className: "$class.name",
                sectionId: "$section._id",
                sectionName: "$section.name"
              }
            }
          ]
        }
      },
      {
        $project: {
          id: "$_id",
          teacherId: "$teacherId",
          username: "$username",
          firstname: "$firstname",
          lastname: "$lastname",
          isLoginAlready: "$isLoginAlready",
          fcmToken: "$fcmToken",
          deviceId: "$deviceId",
          dob: "$dob",
          bloodGroup: "$bloodGroup",
          email: "$email",
          isActive: "$isActive",
          gender: "$gender",
          university: "$university",
          degree: "$degree",
          phone: "$phone",
          address: "$address",
          city: "$city",
          district: "$district",
          state: "$state",
          country: "$country",
          pincode: "$pincode",
          photo: "$photo",
          forgetPasswordCount: "$forgetPasswordCount",
          leaveRequestCount: "$leaveRequestCount",
          section: "$section",
          admin: "$admin",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          sectionId: "$section._id",
          sectionName: "$section.name",
          sectionStudentCount: "$section.studentCount",
          sectionStartTime: "$section.startTime",
          classId: "$class._id",
          className: "$class.name",
          sessionId: "$session._id",
          sessionName: "$session.name",
          sessionStartDate: "$session.startDate",
          sessionEndDate: "$session.endDate",
          sessionStatus: "$session.status",
          sessionStartYear: "$session.academicStartYear",
          sessionEndYear: "$session.academicEndYear",
          sectionSubjects: "$sectionSubjects",
        }
      },
      {
        $project: {
          section: 0,
          _id: 0
        }
      }
    ]);
    return res.status(StatusCodes.OK).send(success(200, teacherInfo));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getAllNonSectionTeacherController(req, res) {
  try {
    const sessionId = req.params.sessionId;
    const adminId = req.adminId;
    const session = await getSessionService({_id: sessionId});
    if (!session) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Invalid session Id"));
    }
    const teachers = await getTeachersService({ admin: adminId, isActive: true });
    const assignedTeachers = await getTeacherSectionSessionsService({ session: sessionId }, { teacher: 1 });
    const assignedTeacherIds = assignedTeachers.map(t => t.teacher.toString());
    const nonSectionTeachers = teachers.filter(teacher => !assignedTeacherIds.includes(teacher._id.toString()));
    return res.send(success(200, nonSectionTeachers));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function changePasswordTeacherController(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;
    const teacherId = req.teacherId;
    const teacher = await getTeacherService({ _id: teacherId, isActive: true });
    if (!teacher) {
      return res.status(StatusCodes.GONE).send(error(410, "Unauthorized user"));
    }
    const isMatched = await matchPasswordService({ enteredPassword: oldPassword, storedPassword: teacher["password"] });
    if (!isMatched) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(401, "Invalid Old Password"));
    }
    const hashedPassword = await hashPasswordService(newPassword);
    teacher["password"] = hashedPassword;
    await teacher.save();

    return res.status(StatusCodes.OK).send(success(200, "Password updated successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function assignTeacherAsGuestTeacherToSectionController(req, res) {
  try {
    const {teacherId, sectionId} = req.body;
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function registerTeachersFromExcelController(req, res) {
  try {
    const file = req.file;
    const adminId = req.adminId;

    if (!file) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Excel file is required"));
    }

    // Expected Excel columns based on teacher model:
    // firstname (required), lastname, phone (required), email, gender, dob, bloodGroup, 
    // university, degree, address, city, district, state, country, pincode
    
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const teachers = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let registeredCount = 0;
    const errors = [];

    teachers.shift();
    for (const teacherData of teachers) {
      try {
        const { firstname, lastname, phone, email, gender, dob, bloodGroup, university, degree, address, city, district, state, country, pincode } = teacherData;

        if (!firstname || !phone) {
          errors.push(`Row with firstname: ${firstname || 'N/A'} - Missing required fields (firstname, phone)`);
          continue;
        }

        const existingTeacher = await getTeacherService({ phone, isActive: true });
        if (existingTeacher) {
          errors.push(`Teacher with phone ${phone} already exists`);
          continue;
        }

        const password = firstname + "@" + phone;
        const hashedPassword = await hashPasswordService(password);

        const teacherObj = {
          firstname,
          lastname: lastname || '',
          phone,
          email: email || '',
          gender: gender || '',
          dob: dob || '',
          bloodGroup: bloodGroup || '',
          university: university || '',
          degree: degree || '',
          address: address || '',
          city: city || '',
          district: district || '',
          state: state || '',
          country: country || '',
          pincode: pincode || '',
          password: hashedPassword,
          admin: adminId
        };

        await registerTeacherService(teacherObj);
        registeredCount++;
      } catch (err) {
        errors.push(`Error registering teacher ${teacherData.firstname || 'Unknown'}: ${err.message}`);
      }
    }

    await fs.unlink(file.path);

    const message = `${registeredCount} teachers registered successfully`;
    const response = { message, registeredCount, errors };

    return res.status(StatusCodes.OK).send(success(201, response));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}