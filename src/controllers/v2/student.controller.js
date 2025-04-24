import { StatusCodes } from "http-status-codes";
import xlsx from 'xlsx';
import fs from 'fs/promises'
import { getStudentService, getStudentsPipelineService, registerStudentService, updateStudentService } from "../../services/student.service.js";
import { error, success } from "../../utills/responseWrapper.js";
import { convertToMongoId } from "../../services/mongoose.services.js";
import { getSectionService, updateSectionService } from "../../services/section.services.js";
import { getClassService } from "../../services/class.sevices.js";
import { getParentService, registerParentService } from "../../services/v2/parent.services.js";
import { getSchoolParentService, registerSchoolParentService, updateSchoolParentService } from "../../services/v2/schoolParent.services.js";
import { registerStudentsFromExcelHelper } from "../../helpers/v2/student.helper.js";

export async function searchStudentsController(req, res){
try{
  let { search, page = 1, limit, classId, section } = req.query;

  const adminId = req.adminId;

  const pageNum = parseInt(page);
  const limitNum = limit ? parseInt(limit) : "no limit";
  const skipNum = (pageNum - 1) * limitNum;
  let filter = {
    admin: convertToMongoId(adminId)
  };

  if(classId) {
    filter['classId'] = convertToMongoId(classId)
  }

  if(section) {
    filter['section'] = convertToMongoId(section)
  }

  if(search){
    search = search.trim();
    const[searchFirstname, searchLastname] = search.split(" ");
    if(searchLastname){
    filter['$and'] = [
        { firstname: { $regex: new RegExp(searchFirstname, "i") } },
        { lastname: { $regex: new RegExp(searchLastname, "i") } },
        {isActive: true}
      ]
  } else {
    filter['$or'] = [
      { firstname: { $regex: new RegExp(search, "i") } },
      { lastname: { $regex: new RegExp(search, "i") } },
      { "parentDetails.email": { $regex: new RegExp(search, "i") } },
      { "parentDetails.phone": { $regex: new RegExp(search, "i") } },
      {isActive: true}
    ]
  }
}

  const pipeline = [
      // Join students with parents
      {
        $lookup: {
          from: "schoolparents",
          localField: "schoolParent",
          foreignField: "_id",
          as: "parentDetails",
          pipeline: [
            {
              $project: {
                password: 0,
                isActive: 0,
                isLoginAlready: 0,
                admin: 0,
              },
            },
          ],
        }
      },
      {
        $unwind: {
          path: "$parentDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $match: filter,
      },

      {
        $sort: { firstname: 1 },
      },
  ];

  if (limit) {
    pipeline.push(
      {
        $skip: skipNum,
      },
      {
        $limit: limitNum,
      }
    );
  }

  // include section info
  pipeline.push({
    $lookup: {
      from: "sections",
      localField: "section",
      foreignField: "_id",
      as: "sectionDetails",
      pipeline: [
        {
          $project: {
            name: 1,
            studentCount: 1,
          },
        },
      ],
    },
  });
  pipeline.push({
    $unwind: {
      path: "$sectionDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  // include class info
  pipeline.push({
    $lookup: {
      from: "classes",
      localField: "classId",
      foreignField: "_id",
      as: "classDetails",
      pipeline: [
        {
          $project: {
            name: 1,
            sectionCount: { $size: "$section" },
          },
        },
      ],
    },
  });
  pipeline.push({
    $unwind: {
      path: "$classDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  //remove other entity ids from student entity
  pipeline.push({
    $project: {
      isActive: 0,
      admin: 0,
      schoolParent: 0,
      section: 0,
      classId: 0,
    },
  });

  const students = await getStudentsPipelineService(pipeline);
  const totalStudents = students.length;
  const totalPages = Math.ceil(totalStudents / limitNum);

  return res.status(StatusCodes.OK).send(
    success(200, {
      students,
      currentPage: pageNum,
      totalPages,
      totalStudents,
      pageSize: limitNum,
    })
  );
}  catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
};

export async function registerStudentController(req, res) {
  try {
    const { firstname, lastname, gender, parentName, phone, sectionId } = req.body;
    const adminId = req.adminId;

    const section = await getSectionService({ _id:sectionId });
    if(!section){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Section not found"));
    }
    const classInfo = await getClassService({ _id:section["classId"] });
    if(!classInfo){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Class not found"));
    }

    let parent = await getParentService({phone, isActive: true});
    let schoolParent = await getSchoolParentService({phone, school:adminId, isActive:true});

    if(!schoolParent) {
      if(!parent) {
        parent = await registerParentService({phone, status: 'unVerified'});
      }
      schoolParent = await registerSchoolParentService({fullname: parentName, phone, school: adminId, parent: parent['_id']});
    }

    let student = await getStudentService({ firstname, schoolParent: schoolParent["_id"] });
    if (student) {
      return res.status(StatusCodes.CONFLICT).send(error(400, "Student already exists"));
    }
    const studentObj = {firstname, lastname, gender, schoolParent: schoolParent["_id"], section:sectionId, classId:classInfo["_id"], admin:adminId};
    student = await registerStudentService(studentObj);

    await updateSectionService({_id:sectionId}, {studentCount:section["studentCount"]+1});
    return res.status(StatusCodes.OK).send(success(201, "Student registered successfully!"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateStudentBySchoolController(req, res){
  try {
    const studentId = req.params.studentId;
    const studentUpdate = {};
    const parentUpdate = {};
    const adminId = req.adminId;

    const student = await getStudentService({ _id:studentId });
    if(!student){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Student not found"));
    }
    let schoolParent = await getSchoolParentService({ _id: student["schoolParent"] });
    if(!schoolParent){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Parent not found"));
    }

    if(req.body["firstname"]){ studentUpdate.firstname = req.body["firstname"]; }
    if(req.body["lastname"]){ studentUpdate.lastname = req.body["lastname"]; }
    if(req.body["gender"]){ studentUpdate.gender = req.body["gender"]; }
    if(req.body["bloodGroup"]){ studentUpdate.bloodGroup = req.body["bloodGroup"]; }
    if(req.body["dob"]){ studentUpdate.dob = req.body["dob"]; }
    if(req.body["photo"] || req.body["method"]==="DELETE"){ studentUpdate.photo = (req.body["method"]==="DELETE")? "": req.body["photo"]; }
    if(req.body["address"]){ studentUpdate.address = req.body["address"]; }
    if(req.body["address"]){ studentUpdate.address = req.body["address"]; }
    if(req.body["city"]){ studentUpdate.city = req.body["city"]; }
    if(req.body["district"]){ studentUpdate.district = req.body["district"]; }
    if(req.body["state"]){ studentUpdate.state = req.body["state"]; }
    if(req.body["country"]){ studentUpdate.country = req.body["country"]; }
    if(req.body["pincode"]){ studentUpdate.pincode = req.body["pincode"]; }


    if(req.body["phone"]){
      const phone = req.body['phone'];
      const schoolParentWithPhone = await getSchoolParentService({ phone, school: student['adminId'], isActive:true, _id: { $ne: schoolParent["_id"] } });
      const parentWithPhone = await getParentService({ phone, isActive:true, _id: {$ne: schoolParent['parent']}});
      if(parentWithPhone || schoolParentWithPhone){
        return res.status(StatusCodes.CONFLICT).send(error(409, "Phone number already registered"));
      }
      if(phone!==schoolParent['phone']) {
        parent = await registerParentService({phone, status: 'unVerified'});
        schoolParent = await registerSchoolParentService({phone, school: adminId, parent: parent['_id']});
       studentUpdate['schoolParent'] = schoolParent['_id'];
      }
    }
    if(req.body["parentName"]){ parentUpdate.fullname = req.body["parentName"]; }
    if(req.body["parentGender"]){ parentUpdate.gender = req.body["parentGender"]; }
    if(req.body["parentAge"]){ parentUpdate.age = req.body["parentAge"]; }
    if(req.body["parentEmail"]){ parentUpdate.email = req.body["parentEmail"]; }
    if(req.body["parentQualification"]){ parentUpdate.qualification = req.body["parentQualification"]; }
    if(req.body["parentOccupation"]){ parentUpdate.occupation = req.body["parentOccupation"]; }
    if(req.body["parentAddress"]){ parentUpdate.address = req.body["parentAddress"]; }
    if(req.body["parentCity"]){ parentUpdate.city = req.body["parentCity"]; }
    if(req.body["parentDistrict"]){ parentUpdate.district = req.body["parentDistrict"]; }
    if(req.body["parentState"]){ parentUpdate.state = req.body["parentState"]; }
    if(req.body["parentCountry"]){ parentUpdate.country = req.body["parentCountry"]; }
    if(req.body["parentPincode"]){ parentUpdate.pincode = req.body["parentPincode"]; }


    await Promise.all([
      updateStudentService({ _id:studentId }, studentUpdate),
      updateSchoolParentService({ _id: schoolParent["_id"] }, parentUpdate)
    ]);
    return res.status(StatusCodes.OK).send(success(200, "Student updated successfully"));

  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function registerStudentsFromExcelController(req, res){
  try {
    const file = req.file;
    const { sectionId, classId } = req.body;
    console.log({sectionId, classId})
    const adminId = req.adminId;

    const[section, classInfo] = await Promise.all([
      getSectionService({ _id: sectionId }),
      getClassService({ _id: classId })
    ])

    if(!section){
      return res.status(StatusCodes.NOT_FOUND).send(success(404, "Section not found"));
    }

    if(!classInfo){
      return res.status(StatusCodes.NOT_FOUND).send(404, "Class not found");
    }

    if(section["classId"].toString()!==classInfo["_id"].toString()){
      return res.status(StatusCodes.BAD_REQUEST).send(success(400, "Invalid class, section ids"));
    }

    const workbook = xlsx.readFile(file.path)
    const sheetName = workbook.SheetNames[0]
    const students = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName])
    const registeredStudentsCount = await registerStudentsFromExcelHelper(students, sectionId, classId, adminId)
    if(registeredStudentsCount===0){
      throw new Error("Student registration failed")
    }
    await fs.unlink(file.path)
    return res.status(StatusCodes.OK).send(success(201,`${registeredStudentsCount} Students registered successfully`))
  } catch(err){
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(501,err.message))
  }
}

export async function updateStudentByParentController(req, res) {
  try {
    const studentId = req.params.studentId;
    const parentId = req.parentId;
    const studentUpdate = {};
    
    const student = await getStudentService({ _id:studentId });
    if(!student){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Student not found"));
    }
    const parent = await getParentService({ _id: parentId});
    if(!parent){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Parent not found"));
    }

    if(!parent['students']?.some(id => id.equals(studentId))) {
          return res.status(StatusCodes.BAD_REQUEST).send(error(400, 'User is not authorized'));
    }

    if(req.body["firstname"]){ studentUpdate.firstname = req.body["firstname"]; }
    if(req.body["lastname"]){ studentUpdate.lastname = req.body["lastname"]; }
    if(req.body["gender"]){ studentUpdate.gender = req.body["gender"]; }
    if(req.body["bloodGroup"]){ studentUpdate.bloodGroup = req.body["bloodGroup"]; }
    if(req.body["dob"]){ studentUpdate.dob = req.body["dob"]; }
    if(req.body["photo"] || req.body["method"]==="DELETE"){ studentUpdate.photo = (req.body["method"]==="DELETE")? "": req.body["photo"]; }    if(req.body["address"]){ studentUpdate.address = req.body["address"]; }
    if(req.body["address"]){ studentUpdate.address = req.body["address"]; }
    if(req.body["city"]){ studentUpdate.city = req.body["city"]; }
    if(req.body["district"]){ studentUpdate.district = req.body["district"]; }
    if(req.body["state"]){ studentUpdate.state = req.body["state"]; }
    if(req.body["country"]){ studentUpdate.country = req.body["country"]; }
    if(req.body["pincode"]){ studentUpdate.pincode = req.body["pincode"]; }

    await updateStudentService({ _id:studentId }, studentUpdate);
    return res.status(StatusCodes.OK).send(success(200, "Student updated successfully"));    
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(501,err.message))
  }
}

export async function getAttendancesController(req, res){
  try {
    let { startTime, endTime, studentId } = req.body;
    const parentId = req.parentId;
    const student = await getStudentService({_id: studentId});
    if(!student) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Student not found"))
    }
    const parent = await getParentService({_id: parentId})
    if(!parent['student'].some(id => id.equals(student._id))) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error(400, 'Unauthorized access'));
    }

    const filter = { isActive: true, _id: convertToMongoId(studentId) };
    const attendanceFilter = {'date': { $gte: Number(startTime), $lte: Number(endTime) }};

    const pipeline = [
      {
        $match: filter,
      },
      {
        $lookup: {
          from: 'sections',
          localField: 'section',
          foreignField: '_id',
          as: 'section',
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$section',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'class',
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$class',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'attendances',
          localField: '_id',
          foreignField: 'student',
          as: 'attendances',
          pipeline: [
            {
              $match: attendanceFilter,
            },
            {
              $project: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: {$toDate: '$date'},
                    timezone: 'Asia/Kolkata'
                  }
                },
                day: 1,
                parentAttendance: 1,
                teacherAttendance: 1
              }
            }
          ],
        },
      },
      {
        $project: {
          firstname: 1,
          lastname: 1,
          gender: 1,
          sectionName: '$section.name',
          className: '$class.name',
          attendances: 1,
        },
      },
    ];
    const attendances = await getStudentsPipelineService(pipeline);
    return res.status(StatusCodes.OK).send(success(200, {
      attendances
    }));
    
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}
