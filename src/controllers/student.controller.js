import studentModel from "../models/student.model.js";
import { StatusCodes } from "http-status-codes";
import { getAttendanceService } from "../services/attendance.service.js";
import { getClassService } from "../services/class.sevices.js";
import { getParentService,registerParentService, updateParentService } from "../services/parent.services.js";
import { hashPasswordService } from "../services/password.service.js";
import { findSectionById, getSectionService, updateSectionService } from "../services/section.services.js";
import { getStudentService, registerStudentService, updateStudentService, getStudentsService, getstudentsService, getStudentCountService, getStudentsPipelineService } from "../services/student.service.js";
import { error, success } from "../utills/responseWrapper.js";
import { convertToMongoId } from "../services/mongoose.services.js";

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

    const parentNames = parentName.split(" ");
    const password = parentNames[0] + "@" + phone;
    const hashedPassword = await hashPasswordService(password);
    let parent = await getParentService({ phone, isActive:true });
    if (!parent) {
      parent = await registerParentService({ fullname: parentName, phone, password: hashedPassword, admin: adminId });
    }

    let student = await getStudentService({ firstname, parent: parent["_id"] });
    if (student) { 
      return res.status(StatusCodes.CONFLICT).send(error(400, "Student already exists"));
    }
    const studentObj = {firstname, lastname, gender, parent:parent["_id"], section:sectionId, classId:classInfo["_id"], admin:adminId};
    student = await registerStudentService(studentObj);

    await updateSectionService({_id:sectionId}, {studentCount:section["studentCount"]+1});
    return res.status(StatusCodes.OK).send(success(201, "Student created successfully!"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function deleteStudentController(req, res) {
  try {
    const studentId = req.params.studentId;
    const student = await getStudentService({ _id: studentId, isActive:true });
    if (!student) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Student doesn't exists"));
    }
  
    const[ parent, section] = await Promise.all([
      getParentService({_id:student["parent"], isActive:true}),
      getSectionService({_id:student["section"]})
    ]);

    if (!parent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Parent doesn't exists"));
    }
    
    await Promise.all([
      updateStudentService({_id:studentId}, {isActive:false}),
      updateSectionService({_id:section["_id"]},{studentCount:section["studentCount"]-1})
    ])

    const siblings = await getStudentsService({parent:student["parent"], isActive:true});
    if (siblings?.length === 0) {
      await updateParentService({_id:student["parent"]}, {isActive:false});
    }

    return res.status(StatusCodes.OK).send(success(200, "Student deleted successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function updateStudentController(req, res){
  try {
    const studentId = req.params.studentId;
    const studentUpdate = {};
    const parentUpdate = {};

    const student = await getStudentService({ _id:studentId });
    if(!student){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Student not found"));
    }
    const parent = await getParentService({ _id: student["parent"] });
    if(!parent){
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Parent not found"));
    }

    if(req.body["firstname"]){ studentUpdate.firstname = req.body["firstname"]; }
    if(req.body["lastname"]){ studentUpdate.lastname = req.body["lastname"]; }
    if(req.body["gender"]){ studentUpdate.gender = req.body["gender"]; }
    if(req.body["bloodGroup"]){ studentUpdate.bloodGroup = req.body["bloodGroup"]; }
    if(req.body["dob"]){ studentUpdate.dob = req.body["dob"]; }
    if(req.body["photo"] || req.body["method"]==="DELETE"){ studentUpdate.photo = (req.body["method"]==="DELETE")? "": req.body["photo"]; }
    if(req.body["address"]){ studentUpdate.address = req.body["address"]; }

    if(req.body["phone"]){ 
      const parentWithPhone = await getParentService({ phone:req.body["phone"], isActive:true, _id: { $ne: parent["_id"] } });
      if(parentWithPhone){
        return res.status(StatusCodes.CONFLICT).send(error(409, "phone number already registered"));
      }
      parentUpdate.phone = req.body["phone"];
    }
    if(req.body["parentName"]){ parentUpdate.fullname = req.body["parentName"]; }
    if(req.body["parentGender"]){ parentUpdate.gender = req.body["parentGender"]; }
    if(req.body["parentAge"]){ parentUpdate.age = req.body["parentAge"]; }
    if(req.body["parentEmail"]){ parentUpdate.email = req.body["parentEmail"]; }
    if(req.body["parentQualification"]){ parentUpdate.qualification = req.body["parentQualification"]; }
    if(req.body["parentOccupation"]){ parentUpdate.occupation = req.body["parentOccupation"]; }
    if(req.body["parentAddress"]){ parentUpdate.address = req.body["parentAddress"]; }

    await Promise.all([ 
      updateStudentService({ _id:studentId }, studentUpdate), 
      updateParentService({ _id: student["parent"] }, parentUpdate) 
    ]);
    return res.status(StatusCodes.OK).send(success(200, "Student updated successfully"));    
    
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getStudentsController(req, res){
    try {
        let {admin, classId, section, parent, student, firstname, lastname, gender, startTime, endTime, include, page = 1, limit = 10 } = req.query;

        if(!admin && !classId && !section && !parent && !student && !firstname && !lastname && !gender){
          return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Invalid request"));
        }
        
        if( admin && req.adminId!==admin ){
          return res.status(StatusCodes.FORBIDDEN).send(error(403, "Forbidden access"));
        }
    
        if(req.role==="parent" && !parent && parent!==req.parentId){
          return res.status(StatusCodes.FORBIDDEN).send(error(403, "Forbidden access"));
        }
        
        if(req.role=="teacher" && !section){
          section = req.sectionId;
        }
    
        if(req.role=="admin" && !admin){
          admin = req.adminId;
        }
    
        if(req.role=="parent" && !parent){
          parent = req.parentId;
        }
    
        if(req.role==="teacher" && (admin || classId ||(section && req.sectionId!==section))){
          return res.status(StatusCodes.FORBIDDEN).send(error(403, "Forbidden access"));
        }
        const filter = { isActive: true };
        if(admin){ filter.admin = convertToMongoId(admin); }
        if(classId){ filter.classId = convertToMongoId(classId); }
        if(section){ filter.section = convertToMongoId(section); }
        if(parent){ filter.parent = convertToMongoId(parent); }
        if(student){ filter._id = convertToMongoId(student); }
        if(firstname){ 
          const regexFirstname = new RegExp(firstname, 'i'); 
          filter.firstname = { $regex: regexFirstname }; 
        }
        if(lastname){ 
          const regexLastname = new RegExp(firstname, 'i'); 
          filter.lastname = { $regex: regexLastname }; 
        }
        if(gender){ filter.gender = gender; }
    
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skipNum = (pageNum-1)*limitNum;

        const pipeline = [
            {
                $match: filter
            },
            {
              $sort:{firstname:1},
            },
            {
              $skip:skipNum
            },
            {
              $limit: limitNum
            }
        ];

        if (include) {
          const includes = include.split(',');
          if(includes.includes('attendance') && (!startTime || !endTime)){
            return res.status(StatusCodes.BAD_REQUEST).send(error(400, "StartTime and endTime is required."));
          }
          if(includes.includes('attendance')) {
            pipeline.push({
              $lookup: {
                  from: 'attendances',
                  let: { 
                    studentId: '$_id',
                    startTime: { $toLong: startTime },
                    endTime: { $toLong: endTime}
                   },
                  pipeline: [
                      {
                          $match: {
                              $expr: {
                                  $and: [
                                      { $eq: ['$student', '$$studentId'] },
                                      {$gte: ['$date', '$$startTime']},
                                      {$lte: ['$date', '$$endTime']}
                                  ]
                              }
                          }
                      },
                      {
                        $project:{
                          date:1,
                          day:1,
                          parentAttendance:1,
                          teacherAttendance:1
                        }
                      },

                  ],
                  as: 'attendance'
              }
          })
          }
          if (includes.includes('parent')) {
            pipeline.push({
              $lookup: {
                from: 'parents',
                localField: 'parent',
                foreignField: '_id',
                as:'parentDetails',
                pipeline: [
                  {
                    $project:{
                      password:0,
                      isActive:0,
                      isLoginAlready:0,
                      admin:0
                    }
                  }
                ]
              }
            });
            pipeline.push({
              $unwind: {
                path: '$parentDetails',
                preserveNullAndEmptyArrays: true
              }
            });
          }
          if (includes.includes('section')) {
            pipeline.push({
              $lookup: {
                from: 'sections',
                localField: 'section',
                foreignField: '_id',
                as:'sectionDetails',
                pipeline: [
                  {
                    $project:{
                      name:1,
                      studentCount:1
                    }
                  }
                ]
              }
            });
            pipeline.push({
              $unwind: {
                path: '$sectionDetails',
                preserveNullAndEmptyArrays: true
              }
            });
          }
          if (includes.includes('class')) {
            pipeline.push({
              $lookup: {
                from: 'classes',
                localField: 'classId',
                foreignField: '_id',
                as:'classDetails',
                pipeline: [
                  {
                    $project:{
                      name:1,
                      sectionCount:{$size:'$section'}
                    }
                  }
                ]
              }
            });
            pipeline.push({
              $unwind: {
                path: '$classDetails',
                preserveNullAndEmptyArrays: true
              }
            });
          }
          if (includes.includes('admin')) {
            pipeline.push({
              $lookup: {
                from: 'admins',
                localField: 'admin',
                foreignField: '_id',
                as:'adminDetails',
                pipeline: [
                  {
                    $project:{
                      schoolName:1,
                      affiliationNo:1,
                      schoolBoard:1,
                      schoolNumber:1,
                      phone:1,
                      email:1,
                      address:1,
                      city:1,
                      state:1
                    }
                  }
                ]
              }
            });
            pipeline.push({
              $unwind: {
                path: '$adminDetails',
                preserveNullAndEmptyArrays: true
              }
            })
          }
        }

        pipeline.push({
          $project:{
            isActive:0,
            admin:0,
            parent:0,
            section:0,
            classId:0
          }
        });

        const students = await getStudentsPipelineService(pipeline);
        console.log({students})
        const totalStudents = await getStudentCountService(filter);
        const totalPages = Math.ceil(totalStudents / limitNum);
    
        return res.status(StatusCodes.OK).send(success(200, {
          students,
          currentPage: pageNum,
          totalPages,
          totalStudents,
          pageSize: limitNum
        }));
    } catch (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    }
};

